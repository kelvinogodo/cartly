import { useState } from 'react'
import { NEXT_STATUSES, useAdminOrders, useSetOrderStatus, type OrderStatus } from '../../hooks/useAdminOrders'
import { useToast } from '../../context/ToastContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatPrice } from '../../lib/format'
import AdminShell from './AdminShell'

const FILTERS: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'fulfilled', 'cancelled']
const ACTION_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirm order',
  fulfilled: 'Mark fulfilled',
  cancelled: 'Cancel & restock',
}

const AdminOrders = () => {
  useDocumentTitle('Admin · Orders')
  const { data: orders, isLoading, error } = useAdminOrders()
  const setStatus = useSetOrderStatus()
  const toast = useToast()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  const visible = orders?.filter((o) => filter === 'all' || o.status === filter) ?? []

  const change = (orderId: string, status: OrderStatus) => {
    if (status === 'cancelled' && !window.confirm('Cancel this order? Its items go back into stock.')) return
    setStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => toast.show({ title: `Order ${status}` }),
        onError: (e) => toast.show({ title: 'Could not update order', description: e.message, tone: 'error' }),
      },
    )
  }

  return (
    <AdminShell>
      <section className="admin-page">
        <div className="admin-toprow">
          <h1 className="serif" style={{ fontSize: 26 }}>Orders</h1>
          <div className="filters" style={{ padding: 0 }} role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button key={f} className={`chip ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--text-muted)' }}>Could not load orders.</p>}
        {orders && visible.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No orders here yet.</p>}

        <div style={{ display: 'grid', gap: 16 }}>
          {visible.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-head">
                <div>
                  <div className="order-id">Order #{order.id.slice(0, 8)}</div>
                  <div className="order-date">{new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className={`order-status ${order.status}`}>{order.status}</div>
              </div>
              <div className="admin-order-ship">
                <strong>{order.shipping_name}</strong> · {order.shipping_phone}<br />
                {order.shipping_address}
              </div>
              <div className="order-items-row">
                {order.order_items.map((item) => (
                  <div key={item.id}>{item.quantity} × {item.product_name} — {formatPrice(item.subtotal)}</div>
                ))}
              </div>
              <div className="admin-order-foot">
                <div className="order-total">Total {formatPrice(order.total)}</div>
                <div className="admin-order-actions">
                  {NEXT_STATUSES[order.status].map((next) => (
                    <button
                      key={next}
                      className={next === 'cancelled' ? 'btn-outline' : 'btn-primary'}
                      disabled={setStatus.isPending}
                      onClick={() => change(order.id, next)}
                    >
                      {ACTION_LABEL[next]}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  )
}

export default AdminOrders
