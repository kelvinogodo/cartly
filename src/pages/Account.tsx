import { useOrders } from '../hooks/useOrders'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatPrice } from '../lib/format'

const Account = () => {
  useDocumentTitle('My orders')
  const { profile, user, signOut } = useAuth()
  const { data: orders, isLoading, error } = useOrders()

  return (
    <div>
      <section className="account-page">
        <div className="account-layout">
          <div className="account-sidebar">
            <div className="account-name serif">{profile?.full_name || user?.email}</div>
            <div className="account-nav">
              <div className="account-nav-item active">Order history</div>
              <button className="account-nav-item" style={{ background: 'none', border: 'none', textAlign: 'left', font: 'inherit', cursor: 'pointer' }} onClick={() => signOut()}>Sign out</button>
            </div>
          </div>

          <div className="account-main">
            <h1 className="serif" style={{ fontSize: 22 }}>Order history</h1>

            {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading orders…</p>}
            {error && <p style={{ color: 'var(--text-muted)' }}>Could not load orders.</p>}
            {orders?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p>}

            {orders?.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-card-head">
                  <div>
                    <div className="order-id">Order #{order.id.slice(0, 8)}</div>
                    <div className="order-date">Placed {new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className={`order-status ${order.status}`}>{order.status}</div>
                </div>
                <div className="order-items-row">
                  {order.order_items.map((item) => (
                    <div key={item.id}>{item.quantity} × {item.product_name}{[item.color, item.size && `Size ${item.size}`].filter(Boolean).length > 0 && ` (${[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(', ')})`}</div>
                  ))}
                </div>
                <div className="order-total">Total {formatPrice(order.total)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Account
