import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../hooks/useCart'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { computeCartTotal } from '../lib/cart'
import { getProductImageUrl } from '../lib/images'

const Checkout = () => {
  const { items, isLoading } = useCart()
  const total = computeCartTotal(items)
  const createOrder = useCreateOrder()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createOrder.mutateAsync({ name, address, phone })
      navigate('/account')
    } catch {
      // error surfaced below via createOrder.isError
    }
  }

  return (
    <div>
      <Header />
      <section className="bag-page">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading your bag…</p>
        ) : items.length === 0 ? (
          <div className="bag-empty">Your bag is empty. <Link to="/">Keep shopping</Link></div>
        ) : (
          <div className="bag-layout">
            <form className="bag-items" style={{ maxWidth: 560 }} onSubmit={onSubmit}>
              <h2 className="serif" style={{ fontSize: 20, marginBottom: 20 }}>Shipping details</h2>
              <div className="field">
                <label>Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Shipping address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="field">
                <label>Phone number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <h2 className="serif" style={{ fontSize: 20, margin: '12px 0 20px' }}>Payment</h2>
              <p style={{ border: '1px solid var(--border)', padding: 16, fontSize: 13, color: 'var(--text-faint)', marginBottom: 24 }}>
                Order placement only in this build — no payment gateway is integrated yet.
              </p>

              {createOrder.isError && <p className="field-error" style={{ marginBottom: 16 }}>{createOrder.error.message}</p>}

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Placing order…' : 'Place order'}
              </button>
            </form>

            <div className="bag-summary">
              <div className="bag-summary-title serif">Order Summary</div>
              {items.map((item) => (
                <div className="mini-line" key={item.productId}>
                  <div className="mini-line-image">
                    <img src={getProductImageUrl(item.product.image_path)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="mini-line-info">
                    <div className="mini-line-name">{item.product.name}</div>
                    <div className="mini-line-meta">{[item.product.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="serif" style={{ color: 'var(--accent)', fontSize: 14 }}>${item.product.price * item.quantity}</div>
                </div>
              ))}
              <div className="bag-summary-total serif">
                <span>Total</span><span className="amount">${total}</span>
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default Checkout
