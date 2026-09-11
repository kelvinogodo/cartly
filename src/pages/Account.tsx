import { FaShopify } from 'react-icons/fa'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useOrders } from '../hooks/useOrders'
import { useAuth } from '../context/AuthContext'

const Account = () => {
  const { profile, user } = useAuth()
  const { data: orders, isLoading, error } = useOrders()

  return (
    <div>
      <Header />
      <section className='cart-page'>
        <div className='cart-page-list'>
          <div className='form-header'>
            <small className='logo'>
              cartly <FaShopify />
            </small>
          </div>
          <h5>{profile?.full_name || user?.email}</h5>
          {isLoading && <p>loading orders...</p>}
          {error && <p>could not load orders.</p>}
          {orders?.length === 0 && <p>no orders yet.</p>}
          {orders?.map((order) => (
            <div key={order.id} className='cart-slide' style={{ flexDirection: 'column', alignItems: 'flex-start', height: 'auto' }}>
              <p>order #{order.id.slice(0, 8)} — <b>{order.status}</b> — total ${order.total}</p>
              <small>{new Date(order.created_at).toLocaleDateString()}</small>
              <ul>
                {order.order_items.map((item) => (
                  <li key={item.id}>{item.quantity} × {item.product_name} — ${item.subtotal}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Account
