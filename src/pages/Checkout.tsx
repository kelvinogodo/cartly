import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../context/ToastContext'
import { getProductImageUrl } from '../lib/images'
import { formatPrice } from '../lib/format'

const Checkout = () => {
  useDocumentTitle('Checkout')
  const { items, total, isLoading } = useCart()
  const createOrder = useCreateOrder()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createOrder.mutateAsync({ name, address, phone })
      toast.show({ title: 'Order placed', description: 'Thank you — you can follow it under My orders.' })
      navigate('/account')
    } catch {
      // error surfaced below via createOrder.isError
    }
  }

  return (
    <div>
      <main className="bag-page">
        <h1 className="bag-title">Checkout</h1>
        {isLoading ? (
          <p className="empty-state">Loading your bag…</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>Your bag is empty</h3>
            <Link to="/" className="btn-primary">Keep shopping</Link>
          </div>
        ) : (
          <div className="bag-layout">
            <form className="bag-items" style={{ maxWidth: 560 }} onSubmit={onSubmit}>
              <h2 className="serif" style={{ fontSize: 22, marginBottom: 20 }}>Shipping details</h2>
              <div className="field">
                <label htmlFor="co-name">Full name</label>
                <input id="co-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="co-address">Shipping address</label>
                <input id="co-address" type="text" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Phone number</label>
                <input id="co-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <h2 className="serif" style={{ fontSize: 22, margin: '12px 0 16px' }}>Payment</h2>
              <p style={{ border: '1px solid var(--border)', background: '#fff', padding: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                This is a demo store — orders are recorded but no payment is taken.
              </p>

              {createOrder.isError && <p className="field-error" style={{ marginBottom: 16 }}>{createOrder.error.message}</p>}

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Placing order…' : `Place order — ${formatPrice(total)}`}
              </button>
            </form>

            <div className="bag-summary">
              <div className="bag-summary-title serif">Order summary</div>
              {items.map((item) => (
                <div className="mini-line" key={item.productId}>
                  <div className="mini-line-image">
                    <img src={getProductImageUrl(item.product.image_path)} alt="" />
                  </div>
                  <div className="mini-line-info">
                    <div className="mini-line-name">{item.product.name}</div>
                    <div className="mini-line-meta">{[item.product.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="serif" style={{ color: 'var(--accent)', fontSize: 14 }}>{formatPrice(item.product.price * item.quantity)}</div>
                </div>
              ))}
              <div className="bag-summary-total serif">
                <span>Total</span><span className="amount">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Checkout
