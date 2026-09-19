import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiHeart } from 'react-icons/fi'
import { ProductCard } from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/ui/ProductGridSkeleton'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../hooks/useWishlist'
import { useProductsByIds } from '../hooks/useProductsByIds'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const Wishlist = () => {
  useDocumentTitle('Wishlist')
  const { user } = useAuth()
  const { likedIds, isLoading: loadingIds } = useWishlist()
  const ids = useMemo(() => Array.from(likedIds), [likedIds])
  const { data: products, isLoading: loadingProducts } = useProductsByIds(ids)

  // filter against the live set so an un-hearted card leaves immediately
  const items = useMemo(() => (products ?? []).filter((p) => likedIds.has(p.id)), [products, likedIds])
  const loading = loadingIds || (ids.length > 0 && loadingProducts && items.length === 0)

  return (
    <div>
      <main className="section is-last" style={{ minHeight: '60vh', paddingTop: 40 }}>
        <div className="section-head">
          <div>
            <div className="section-eyebrow">Saved</div>
            <h1 className="section-title">Your wishlist</h1>
          </div>
          {items.length > 0 && <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>{items.length} {items.length === 1 ? 'piece' : 'pieces'}</span>}
        </div>

        {!user && items.length > 0 && (
          <p className="results-note" style={{ paddingBottom: 28 }}>
            Saved on this device. <Link to="/login" style={{ textDecoration: 'underline' }}>Sign in</Link> to keep your wishlist everywhere.
          </p>
        )}

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <motion.div className="empty-state" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <FiHeart size={34} />
            <h3>Nothing saved yet</h3>
            <p>Tap the heart on any piece to keep it here for later.</p>
            <Link to="/" className="btn-primary">Browse the collection</Link>
          </motion.div>
        ) : (
          <div className="pgrid">
            <AnimatePresence>
              {items.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}

export default Wishlist
