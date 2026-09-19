-- Server-side order placement.
--
-- Until now the browser inserted `orders` and `order_items` itself, so the total
-- and unit prices were whatever the client claimed, stock was never decremented,
-- and a failure between the two inserts left an order with no lines.
-- `place_order` does all of it in one transaction using the real product rows.

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

  -- Collapse duplicate product ids and lock rows in a stable order (no deadlocks
  -- between two customers buying overlapping baskets).
  for v_line in
    select (e ->> 'product_id')::uuid as product_id,
           sum((e ->> 'quantity')::int) as quantity
    from jsonb_array_elements(p_items) as e
    group by 1
    order by 1
  loop
    if v_line.quantity is null or v_line.quantity < 1 then
      raise exception 'Invalid quantity' using errcode = '22023';
    end if;

    select * into v_product from public.products where id = v_line.product_id for update;
    if not found then
      raise exception 'An item in your bag is no longer available' using errcode = 'P0002';
    end if;

    if v_product.stock < v_line.quantity then
      raise exception '% only has % left in stock', v_product.name, v_product.stock
        using errcode = 'P0001';
    end if;

    update public.products set stock = stock - v_line.quantity where id = v_product.id;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
    values (v_order.id, v_product.id, v_product.name, v_product.price, v_line.quantity,
            v_product.price * v_line.quantity);

    v_total := v_total + v_product.price * v_line.quantity;
  end loop;

  update public.orders set total = v_total where id = v_order.id returning * into v_order;

  delete from public.cart_items where user_id = v_user;

  return v_order;
end;
$$;

revoke all on function public.place_order(text, text, text, jsonb) from public, anon;
grant execute on function public.place_order(text, text, text, jsonb) to authenticated;

-- Clients can no longer write orders directly; only place_order (security definer) can.
drop policy if exists "orders_owner_insert" on public.orders;
drop policy if exists "order_items_owner_insert" on public.order_items;
