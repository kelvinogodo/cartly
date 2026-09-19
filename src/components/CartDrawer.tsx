import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMinus, FiPlus, FiShoppingBag, FiX } from 'react-icons/fi'
import { useCart } from '../hooks/useCart'
import { useCartDrawer } from '../context/CartDrawerContext'
import { getProductImageUrl } from '../lib/images'
import { formatPrice } from '../lib/format'
import { describeSelection, lineKey, unitsOfProduct } from '../lib/cart'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Slide-over bag: opens on add-to-bag and from the header, without leaving the page. */
export function CartDrawer() {
  const { isOpen, close } = useCartDrawer()
  const { items, count, total, setQuantity, removeItem } = useCart()
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusTo = useRef<HTMLElement | null>(null)

  // navigating anywhere closes it
  useEffect(() => close(), [pathname, close])

  useEffect(() => {
    if (!isOpen) return
    returnFocusTo.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      // keep Tab inside the dialog
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      returnFocusTo.current?.focus?.()
    }
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />
          <motion.aside
            key="panel"
            ref={panelRef}
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }}
          >
            <div className="drawer-head">
              <h2 className="serif">Your bag{count > 0 ? ` (${count})` : ''}</h2>
              <button className="drawer-close" onClick={close} aria-label="Close bag" data-autofocus>
                <FiX size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="drawer-empty">
                <FiShoppingBag size={30} />
                <p>Your bag is empty.</p>
                <button className="btn-outline" onClick={close}>Keep shopping</button>
              </div>
            ) : (
              <>
                <ul className="drawer-lines">
                  {items.map((item) => {
                    const { product, quantity, productId, size, color } = item
                    const atMax = unitsOfProduct(items, productId) >= product.stock
                    const selection = { size, color }
                    return (
                      <li className="drawer-line" key={lineKey(item)}>
                        <Link to={`/products/${product.slug}`} className="drawer-thumb" aria-label={product.name}>
                          <img src={getProductImageUrl(product.image_path)} alt="" />
                        </Link>
                        <div className="drawer-info">
                          <Link to={`/products/${product.slug}`} className="drawer-name">{product.name}</Link>
                          <div className="bag-line-meta">{describeSelection(selection)}</div>
                          <div className="qty-stepper">
                            <button onClick={() => setQuantity(product, selection, quantity - 1)} disabled={quantity <= 1} aria-label={`Decrease quantity of ${product.name}`}><FiMinus size={12} /></button>
                            <span aria-live="polite">{quantity}</span>
                            <button onClick={() => setQuantity(product, selection, quantity + 1)} disabled={atMax} aria-label={`Increase quantity of ${product.name}`}><FiPlus size={12} /></button>
                          </div>
                        </div>
                        <div className="drawer-side">
                          <span className="bag-line-price">{formatPrice(product.price * quantity)}</span>
                          <button className="bag-line-remove" onClick={() => removeItem({ productId, size, color })} aria-label={`Remove ${product.name}`}>
                            <FiX size={16} />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="drawer-foot">
                  <div className="drawer-total"><span>Subtotal</span><span className="serif">{formatPrice(total)}</span></div>
                  <Link to="/checkout" className="btn-primary">Checkout</Link>
                  <Link to="/cart" className="drawer-viewbag">View full bag</Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
