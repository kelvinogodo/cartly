import { useNavigate, useParams } from 'react-router-dom'
import { FiHeart, FiShoppingBag } from 'react-icons/fi'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useProduct } from '../hooks/useProduct'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { getProductImageUrl } from '../lib/images'

const ProductDetail = () => {
  const { slug } = useParams()
  const { data: product, isLoading, error } = useProduct(slug)
  const { likedIds, toggle } = useWishlist()
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const liked = product ? likedIds.has(product.id) : false

  const onLikeClick = () => {
    if (!product) return
    if (!user) { navigate('/login'); return }
    toggle(product.id)
  }

  return (
    <div>
      <Header />
      {isLoading && <p style={{textAlign:'center', padding:'60px 0'}}>Loading…</p>}
      {error && <p style={{textAlign:'center', padding:'60px 0'}}>Product not found.</p>}
      {product && (
        <>
          <div className="pd-layout">
            <div className="pd-gallery">
              <div className="pd-thumbs">
                <div className="pd-thumb active"><img src={getProductImageUrl(product.image_path)} alt="" /></div>
              </div>
              <div className="pd-main-image">
                <img src={getProductImageUrl(product.image_path)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div className="pd-info">
              <div>
                <div className="pd-name">{product.name}</div>
                <div className="pd-price serif">${product.price}</div>
              </div>

              {product.color && (
                <div>
                  <div className="pd-attr-label">Color</div>
                  <div className="pd-attr-value">{product.color}</div>
                </div>
              )}

              {product.size && (
                <div>
                  <div className="pd-attr-label">Size</div>
                  <div className="pd-attr-value">{product.size}</div>
                </div>
              )}

              {product.description && <p className="pd-description">{product.description}</p>}

              <div className="pd-actions desktop-only">
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => addItem(product.id)} disabled={product.stock <= 0}>
                  <FiShoppingBag size={15} style={{ marginRight: 8 }} />
                  {product.stock > 0 ? 'Add to bag' : 'Out of stock'}
                </button>
                <button className={`pd-wishlist-btn ${liked ? 'liked' : ''}`} onClick={onLikeClick} aria-label="Wishlist">
                  <FiHeart size={18} fill={liked ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="pd-details">
                {product.made_in && <div className="pd-details-row"><span>Made in</span><span>{product.made_in}</span></div>}
                <div className="pd-details-row"><span>Availability</span><span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span></div>
              </div>
            </div>
          </div>

          <div className="pd-sticky-bar" style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => addItem(product.id)} disabled={product.stock <= 0}>
              {product.stock > 0 ? `Add to bag — $${product.price}` : 'Out of stock'}
            </button>
            <button className={`pd-wishlist-btn ${liked ? 'liked' : ''}`} onClick={onLikeClick} aria-label="Wishlist" style={{ width: 56, height: 'auto' }}>
              <FiHeart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </>
      )}
      <Footer />
    </div>
  )
}

export default ProductDetail
