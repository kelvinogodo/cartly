import { Link, useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../hooks/useCart'
import { computeCartTotal } from '../lib/cart'
import { getProductImageUrl } from '../lib/images'

const CartPage = () => {
  const { items, removeItem, setQuantity, isLoading } = useCart()
  const total = computeCartTotal(items)
  const navigate = useNavigate()

  return (
    <div>
      <Header />
      <section className="bag-page">
        <h1 className="section-heading serif" style={{ padding: '0 0 32px' }}>Your Bag</h1>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading your bag…</p>
        ) : items.length === 0 ? (
          <div className="bag-empty">Your bag is empty. <Link to="/">Keep shopping</Link></div>
        ) : (
          <div className="bag-layout">
            <div className="bag-items">
              <div className="bag-head-row">
                <div style={{ flex: 1 }}>Item</div>
                <div style={{ width: 140 }}>Quantity</div>
                <div style={{ width: 100, textAlign: 'right' }}>Price</div>
                <div style={{ width: 40 }} />
              </div>

              {items.map((cartItem) => (
                <div className="bag-line" key={cartItem.productId}>
                  <div className="bag-line-image">
                    <img src={getProductImageUrl(cartItem.product.image_path)} alt={cartItem.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="bag-line-info">
                    <div className="bag-line-name">{cartItem.product.name}</div>
                    <div className="bag-line-meta">
                      {[cartItem.product.color, cartItem.product.size && `Size ${cartItem.product.size}`].filter(Boolean).join(' · ')}
                    </div>
                    <div className="bag-line-row">
                      <div className="qty-stepper">
                        <button onClick={() => setQuantity(cartItem.productId, cartItem.quantity - 1)} aria-label="Decrease">−</button>
                        <span>{cartItem.quantity}</span>
                        <button onClick={() => setQuantity(cartItem.productId, cartItem.quantity + 1)} aria-label="Increase">+</button>
                      </div>
                      <span className="bag-line-price serif">${cartItem.product.price}</span>
                    </div>
                  </div>
                  <button className="bag-line-remove" onClick={() => removeItem(cartItem.productId)} aria-label="Remove">
                    <FiX size={18} />
                  </button>
                </div>
              ))}

              <Link to="/" className="bag-continue">← Continue shopping</Link>
            </div>

            <div className="bag-summary">
              <div className="bag-summary-title serif">Order Summary</div>
              <div className="bag-summary-row"><span>Subtotal</span><span>${total}</span></div>
              <div className="bag-summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="bag-summary-total serif">
                <span>Total</span><span className="amount">${total}</span>
              </div>
              <button className="btn-primary" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default CartPage
