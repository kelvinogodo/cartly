-- Admin order management.
--
-- Status changes go through one function instead of a blanket UPDATE policy so
-- that (a) only sensible transitions are allowed, (b) cancelling an order puts
-- its stock back, and (c) an admin can't rewrite totals or shipping details.

create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_line record;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;

  if not (
    (v_order.status = 'pending'   and p_status in ('confirmed', 'cancelled')) or
    (v_order.status = 'confirmed' and p_status in ('fulfilled', 'cancelled'))
  ) then
    raise exception 'A % order cannot be marked %', v_order.status, p_status using errcode = 'P0001';
  end if;

  if p_status = 'cancelled' then
    for v_line in
      select product_id, quantity from public.order_items
      where order_id = v_order.id and product_id is not null
    loop
      update public.products set stock = stock + v_line.quantity where id = v_line.product_id;
    end loop;
  end if;

  update public.orders set status = p_status where id = v_order.id returning * into v_order;
  return v_order;
end;
$$;

revoke all on function public.set_order_status(uuid, text) from public, anon;
grant execute on function public.set_order_status(uuid, text) to authenticated;

drop policy if exists "orders_admin_update" on public.orders;
