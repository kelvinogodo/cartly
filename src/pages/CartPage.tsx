import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMinus, FiPlus, FiShoppingBag, FiX } from 'react-icons/fi'
import { useCart } from '../hooks/useCart'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getProductImageUrl } from '../lib/images'
import { formatPrice } from '../lib/format'

const CartPage = () => {
  useDocumentTitle('Your bag')
  const { items, count, total, isLoading, setQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  return (
    <div>
      <main className="bag-page">
        <h1 className="bag-title">Your Bag{count > 0 ? ` (${count})` : ''}</h1>

        {isLoading ? (
          <p className="empty-state">Loading your bag…</p>
        ) : items.length === 0 ? (
          <motion.div className="empty-state" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <FiShoppingBag size={34} />
            <h3>Your bag is empty</h3>
            <p>Pieces you add will wait for you here.</p>
            <Link to="/" className="btn-primary">Start shopping</Link>
          </motion.div>
        ) : (
          <div className="bag-layout">
            <div className="bag-items">
              <div className="bag-head-row">
                <div>Item</div>
                <div>Quantity</div>
                <div style={{ textAlign: 'right' }}>Price</div>
                <div />
              </div>

              <AnimatePresence initial={false}>
                {items.map(({ productId, product, quantity }) => {
                  const atMax = quantity >= product.stock
                  return (
                    <motion.div
                      className="bag-line"
                      key={productId}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }}
                    >
                      <Link to={`/products/${product.slug}`} className="bag-line-image" aria-label={product.name}>
                        <img src={getProductImageUrl(product.image_path)} alt="" />
                      </Link>
                      <div className="bag-line-info">
                        <div className="bag-line-name"><Link to={`/products/${product.slug}`}>{product.name}</Link></div>
                        <div className="bag-line-meta">{[product.color, product.size && `Size ${product.size}`].filter(Boolean).join(' · ')}</div>
                        {atMax && <div className="bag-line-warn">Maximum available ({product.stock})</div>}
                      </div>
                      <div className="bag-line-qty">
                        <div className="qty-stepper">
                          <button onClick={() => setQuantity(product, quantity - 1)} disabled={quantity <= 1} aria-label={`Decrease quantity of ${product.name}`}><FiMinus size={13} /></button>
                          <span aria-live="polite">{quantity}</span>
                          <button onClick={() => setQuantity(product, quantity + 1)} disabled={atMax} aria-label={`Increase quantity of ${product.name}`}><FiPlus size={13} /></button>
                        </div>
                      </div>
                      <span className="bag-line-price">{formatPrice(product.price * quantity)}</span>
                      <button className="bag-line-remove" onClick={() => removeItem(productId)} aria-label={`Remove ${product.name}`}>
                        <FiX size={18} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              <Link to="/" className="bag-continue">← Continue shopping</Link>
            </div>

            <div className="bag-summary">
              <div className="bag-summary-title serif">Order summary</div>
              <div className="bag-summary-row"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="bag-summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="bag-summary-total serif">
                <span>Total</span>
                <motion.span key={total} className="amount" initial={{ opacity: 0.4, y: -6 }} animate={{ opacity: 1, y: 0 }}>{formatPrice(total)}</motion.span>
              </div>
              <button className="btn-primary" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage
