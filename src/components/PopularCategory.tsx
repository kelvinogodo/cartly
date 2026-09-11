import { Link, useNavigate } from 'react-router-dom'
import { FiHeart, FiPlus } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import { useFeaturedProducts } from '../hooks/useFeaturedProducts'
import { useWishlist } from '../hooks/useWishlist'
import { getProductImageUrl } from '../lib/images'

const PopularCategory = () => {
    const { data: products } = useFeaturedProducts()
    const { user } = useAuth()
    const { addItem } = useCart()
    const { likedIds, toggle } = useWishlist()
    const navigate = useNavigate()

    const onLikeClick = (productId: string) => {
      if (!user) {
        navigate('/login')
        return
      }
      toggle(productId)
    }

  if (!products || products.length === 0) return null

  return (
    <>
      <h2 className="section-heading serif">Recently added</h2>
      <div className="product-grid">
        {products.map((item) => (
          <div className="product-card" key={item.id}>
            <div className="product-card-image-wrap">
              <button
                className={`product-card-like ${likedIds.has(item.id) ? 'liked' : ''}`}
                onClick={() => onLikeClick(item.id)}
                aria-label="Wishlist"
              >
                <FiHeart size={16} fill={likedIds.has(item.id) ? 'currentColor' : 'none'} />
              </button>
              <Link to={`/products/${item.slug}`} className="product-card-link">
                <img src={getProductImageUrl(item.image_path)} alt={item.name} />
              </Link>
            </div>
            <div className="product-card-name">{item.name}</div>
            <div className="product-card-price serif">${item.price}</div>
            <button className="product-card-add" onClick={() => addItem(item.id)}>
              <FiPlus size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />Add
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

export default PopularCategory
