-- Product options (size / colour choices), a photo gallery, and option-aware bags and orders.
--
-- Stock deliberately stays a single number per product: the shopper chooses a
-- size/colour, the choice is recorded on the bag line and order line, and every
-- size draws from the same stock pool. A per-variant stock matrix would be the
-- next step if sizes need to sell out independently.

-- ---------- product options ----------
alter table public.products
  add column if not exists sizes  text[] not null default '{}',
  add column if not exists colors text[] not null default '{}';

update public.products set colors = array[color] where color is not null and color <> '' and colors = '{}';
update public.products set sizes  = array[size]
  where size is not null and size <> '' and size !~ '[–-]' and lower(size) <> 'one size' and sizes = '{}';

alter table public.products drop column if exists size, drop column if exists color;

-- ---------- gallery (extra photos; products.image_path stays the cover) ----------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_id_idx on public.product_images(product_id, sort_order);

alter table public.product_images enable row level security;
create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_images_admin_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- bag lines carry the chosen option ('' = none) ----------
alter table public.cart_items
  add column if not exists size  text not null default '',
  add column if not exists color text not null default '';
alter table public.cart_items drop constraint if exists cart_items_user_id_product_id_key;
alter table public.cart_items add constraint cart_items_line_key unique (user_id, product_id, size, color);

-- ---------- order lines snapshot the chosen option ----------
alter table public.order_items
  add column if not exists size  text,
  add column if not exists color text;

-- ---------- place_order: validate options, still all-or-nothing ----------
create or replace function public.place_order(
  p_shipping_name text,
  p_shipping_address text,
  p_shipping_phone text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order public.orders;
  v_total numeric(10,2) := 0;
  v_line record;
  v_product public.products;
begin
  if v_user is null then
    raise exception 'Sign in to place an order' using errcode = '28000';
  end if;

  if nullif(btrim(p_shipping_name), '') is null
     or nullif(btrim(p_shipping_address), '') is null
     or nullif(btrim(p_shipping_phone), '') is null then
    raise exception 'Shipping name, address and phone are required' using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty' using errcode = '22023';
  end if;

  insert into public.orders (user_id, total, shipping_name, shipping_address, shipping_phone)
  values (v_user, 0, btrim(p_shipping_name), btrim(p_shipping_address), btrim(p_shipping_phone))
  returning * into v_order;

  -- One line per product+size+colour; rows are locked in a stable order so two
  -- customers with overlapping baskets can't deadlock. Stock is checked and
  -- decremented line by line, so several sizes of one product share the pool.
  for v_line in
    select (e ->> 'product_id')::uuid as product_id,
           coalesce(nullif(btrim(e ->> 'size'), ''), '')  as size,
           coalesce(nullif(btrim(e ->> 'color'), ''), '') as color,
           sum((e ->> 'quantity')::int) as quantity
    from jsonb_array_elements(p_items) as e
    group by 1, 2, 3
    order by 1, 2, 3
  loop
    if v_line.quantity is null or v_line.quantity < 1 then
      raise exception 'Invalid quantity' using errcode = '22023';
    end if;

    select * into v_product from public.products where id = v_line.product_id for update;
    if not found then
      raise exception 'An item in your bag is no longer available' using errcode = 'P0002';
    end if;

    if cardinality(v_product.sizes) > 0 then
      if v_line.size = '' then
        raise exception 'Choose a size for %', v_product.name using errcode = '22023';
      elsif not (v_line.size = any (v_product.sizes)) then
        raise exception '% is not available in size %', v_product.name, v_line.size using errcode = '22023';
      end if;
    elsif v_line.size <> '' then
      raise exception '% does not come in sizes', v_product.name using errcode = '22023';
    end if;

    if cardinality(v_product.colors) > 0 then
      if v_line.color = '' then
        raise exception 'Choose a colour for %', v_product.name using errcode = '22023';
      elsif not (v_line.color = any (v_product.colors)) then
        raise exception '% is not available in %', v_product.name, v_line.color using errcode = '22023';
      end if;
    elsif v_line.color <> '' then
      raise exception '% does not come in colours', v_product.name using errcode = '22023';
    end if;

    if v_product.stock < v_line.quantity then
      raise exception '% only has % left in stock', v_product.name, v_product.stock
        using errcode = 'P0001';
    end if;

    update public.products set stock = stock - v_line.quantity where id = v_product.id;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, subtotal, size, color)
    values (v_order.id, v_product.id, v_product.name, v_product.price, v_line.quantity,
            v_product.price * v_line.quantity, nullif(v_line.size, ''), nullif(v_line.color, ''));

    v_total := v_total + v_product.price * v_line.quantity;
  end loop;

  update public.orders set total = v_total where id = v_order.id returning * into v_order;

  delete from public.cart_items where user_id = v_user;

  return v_order;
end;
$$;

revoke all on function public.place_order(text, text, text, jsonb) from public, anon;
grant execute on function public.place_order(text, text, text, jsonb) to authenticated;
