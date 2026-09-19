import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheck, FiEdit2, FiHeart, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../hooks/useWishlist'
import { useAddToBag } from '../hooks/useAddToBag'
import { useDeleteProduct } from '../hooks/useProductMutations'
import { useImageLoaded } from '../hooks/useImageLoaded'
import { getProductImageUrl } from '../lib/images'
import { formatPrice } from '../lib/format'
import type { Product } from '../types/domain'

const LOW_STOCK_THRESHOLD = 5

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isAdmin } = useAuth()
  const { isLiked, toggle } = useWishlist()
  const addToBag = useAddToBag()
  const deleteProduct = useDeleteProduct()
  const [justAdded, setJustAdded] = useState(false)

  const src = getProductImageUrl(product.image_path)
  const { ref, loaded, onLoad } = useImageLoaded(src)
  const liked = isLiked(product.id)
  const soldOut = product.stock <= 0
  const lowStock = !soldOut && product.stock <= LOW_STOCK_THRESHOLD
  // several sizes/colours: the shopper has to choose on the product page
  const needsChoice = product.sizes.length > 1 || product.colors.length > 1

  useEffect(() => {
    if (!justAdded) return
    const timer = window.setTimeout(() => setJustAdded(false), 1600)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  const onAdd = () => {
    if (addToBag(product) === 'added') setJustAdded(true)
  }

  const onDelete = () => {
    if (window.confirm(`Delete "${product.name}"? This can't be undone.`)) {
      deleteProduct.mutate(product.id)
    }
  }

  return (
    <motion.article
      layout
      className={`pcard ${soldOut ? 'is-soldout' : ''}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.06, ease: [0.22, 0.8, 0.24, 1] }}
    >
      <div className={`pcard-media ${loaded ? '' : 'is-loading'}`}>
        <Link to={`/products/${product.slug}`} className="pcard-link" aria-label={product.name}>
          <img
            ref={ref}
            src={src}
            alt={product.name}
            width={800}
            height={1000}
            loading="lazy"
            decoding="async"
            onLoad={onLoad}
            className={`pcard-img ${loaded ? 'is-loaded' : ''}`}
          />
        </Link>

        <div className="pcard-tags">
          {soldOut && <span className="pcard-badge">Sold out</span>}
          {lowStock && <span className="pcard-badge is-alert">Only {product.stock} left</span>}
          {isAdmin && (
            <div className="pcard-admin">
              <Link to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}><FiEdit2 size={13} /></Link>
              <button onClick={onDelete} aria-label={`Delete ${product.name}`}><FiTrash2 size={13} /></button>
            </div>
          )}
        </div>

        <button
          className={`pcard-like ${liked ? 'is-liked' : ''}`}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          onClick={() => toggle(product)}
        >
          <motion.span
            key={liked ? 'liked' : 'not-liked'}
            initial={{ scale: 0.55 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 14 }}
          >
            <FiHeart size={17} fill={liked ? 'currentColor' : 'none'} />
          </motion.span>
        </button>

        {needsChoice && !soldOut ? (
          <Link className="pcard-quick" to={`/products/${product.slug}`} aria-label={`Choose options for ${product.name}`}>
            <FiPlus size={15} />
            <span className="pcard-quick-label">{product.sizes.length > 1 ? 'Select size' : 'Select colour'}</span>
          </Link>
        ) : (
          <button
            className="pcard-quick"
            disabled={soldOut}
            onClick={onAdd}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to bag`}
          >
            {justAdded ? <FiCheck size={15} /> : <FiPlus size={15} />}
            <span className="pcard-quick-label">{soldOut ? 'Sold out' : justAdded ? 'Added' : 'Quick add'}</span>
          </button>
        )}
      </div>

      <div className="pcard-body">
        <h3 className="pcard-name" style={{ fontWeight: 400 }}>
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <span className="pcard-price">{formatPrice(product.price)}</span>
      </div>
    </motion.article>
  )
}
