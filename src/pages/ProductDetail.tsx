import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheck, FiHeart, FiShoppingBag } from 'react-icons/fi'
import { ProductCard } from '../components/ProductCard'
import { SectionHead } from '../components/ui/SectionHead'
import NotFound from './NotFound'
import { useProduct } from '../hooks/useProduct'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useAddToBag } from '../hooks/useAddToBag'
import { useImageLoaded } from '../hooks/useImageLoaded'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getProductImageUrl } from '../lib/images'
import { formatPrice } from '../lib/format'

const ProductDetail = () => {
  const { slug } = useParams()
  const { data: product, isLoading, error } = useProduct(slug)
  const { data: categories } = useCategories()
  const { isLiked, toggle } = useWishlist()
  const { items } = useCart()
  const addToBag = useAddToBag()
  const [justAdded, setJustAdded] = useState(false)

  useDocumentTitle(product?.name)

  const src = product ? getProductImageUrl(product.image_path) : ''
  const { ref, loaded, onLoad } = useImageLoaded(src)

  useEffect(() => {
    if (!justAdded) return
    const timer = window.setTimeout(() => setJustAdded(false), 1800)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  const category = categories?.find((c) => c.id === product?.category_id)
  const { data: sameCategory } = useProducts({ categoryId: product?.category_id ?? null })
  const related = useMemo(
    () => (product ? (sameCategory ?? []).filter((p) => p.id !== product.id && p.category_id === product.category_id).slice(0, 4) : []),
    [sameCategory, product]
  )

  if (!isLoading && (error || !product)) return <NotFound />

  const liked = product ? isLiked(product.id) : false
  const inBag = product ? items.find((item) => item.productId === product.id)?.quantity ?? 0 : 0
  const soldOut = !!product && product.stock <= 0
  const lowStock = !!product && !soldOut && product.stock <= 5

  const onAdd = () => {
    if (product && addToBag(product) === 'added') setJustAdded(true)
  }

  const addLabel = soldOut ? 'Sold out' : justAdded ? 'Added to bag' : 'Add to bag'

  return (
    <div>

      {isLoading || !product ? (
        <div className="pd-layout" aria-busy="true">
          <div className="pd-gallery"><div className="pd-main-image skel" /></div>
          <div className="pd-info">
            <div className="skel" style={{ height: 40, width: '80%' }} />
            <div className="skel" style={{ height: 24, width: '25%' }} />
            <div className="skel" style={{ height: 120 }} />
          </div>
        </div>
      ) : (
        <>
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            {category && (<><Link to="/">{category.name}</Link><span>/</span></>)}
            <span className="is-current" aria-current="page">{product.name}</span>
          </nav>

          <motion.div className="pd-layout" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}>
            <div className="pd-gallery">
              <div className={`pd-main-image ${loaded ? '' : 'skel'}`}>
                <img
                  ref={ref}
                  src={src}
                  alt={product.name}
                  width={800}
                  height={1000}
                  onLoad={onLoad}
                  style={{ opacity: loaded ? 1 : 0, transition: 'opacity .5s ease' }}
                />
              </div>
            </div>

            <div className="pd-info">
              <div>
                <h1 className="pd-name">{product.name}</h1>
                <div className="pd-price serif">{formatPrice(product.price)}</div>
              </div>

              <div className={`pd-stock ${soldOut ? 'is-out' : lowStock ? 'is-low' : ''}`}>
                {soldOut ? 'Sold out' : lowStock ? `Only ${product.stock} left` : 'In stock'}
                {inBag > 0 && <span style={{ color: 'var(--text-faint)', marginLeft: 12 }}>· {inBag} in your bag</span>}
              </div>

              {product.description && <p className="pd-description">{product.description}</p>}

              {product.color && (
                <div>
                  <div className="pd-attr-label">Colour</div>
                  <div className="pd-attr-value">{product.color}</div>
                </div>
              )}
              {product.size && (
                <div>
                  <div className="pd-attr-label">Size</div>
                  <div className="pd-attr-value">{product.size}</div>
                </div>
              )}

              <div className="pd-actions desktop-only">
                <button className="btn-primary" onClick={onAdd} disabled={soldOut}>
                  {justAdded ? <FiCheck size={16} /> : <FiShoppingBag size={16} />} {addLabel}
                </button>
                <button
                  className={`pd-wishlist-btn ${liked ? 'is-liked' : ''}`}
                  onClick={() => toggle(product)}
                  aria-pressed={liked}
                  aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <motion.span key={liked ? 'on' : 'off'} initial={{ scale: 0.55 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 14 }} style={{ display: 'grid' }}>
                    <FiHeart size={19} fill={liked ? 'currentColor' : 'none'} />
                  </motion.span>
                </button>
              </div>

              <div className="pd-details">
                {product.made_in && <div className="pd-details-row"><span>Made in</span><span>{product.made_in}</span></div>}
                {category && <div className="pd-details-row"><span>Category</span><span>{category.name}</span></div>}
              </div>
            </div>
          </motion.div>

          {related.length > 0 && (
            <section className="section pd-related" aria-labelledby="related-title">
              <SectionHead id="related-title" eyebrow="You may also like" title={`More from ${category?.name ?? 'the collection'}`} />
              <div className="pgrid">
                {related.map((p, index) => <ProductCard key={p.id} product={p} index={index} />)}
              </div>
            </section>
          )}

          <div className="pd-sticky-bar mobile-only">
            <button className="btn-primary" onClick={onAdd} disabled={soldOut}>
              {soldOut ? 'Sold out' : justAdded ? 'Added to bag' : `Add to bag — ${formatPrice(product.price)}`}
            </button>
            <button
              className={`pd-wishlist-btn ${liked ? 'is-liked' : ''}`}
              onClick={() => toggle(product)}
              aria-pressed={liked}
              aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
              style={{ width: 56 }}
            >
              <FiHeart size={19} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductDetail
