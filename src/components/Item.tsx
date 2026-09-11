import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useDeleteProduct } from '../hooks/useProductMutations'
import { getProductImageUrl } from '../lib/images'
import type { Product } from '../types/domain'

const Item = ({item}: {item: Product}) => {
  const { user, isAdmin } = useAuth()
  const { addItem } = useCart()
  const { likedIds, toggle } = useWishlist()
  const deleteProduct = useDeleteProduct()
  const navigate = useNavigate()
  const liked = likedIds.has(item.id)

  const onLikeClick = () => {
    if (!user) {
      navigate('/login')
      return
    }
    toggle(item.id)
  }

  const onDelete = () => {
    if (window.confirm(`Delete "${item.name}"? This can't be undone.`)) {
      deleteProduct.mutate(item.id)
    }
  }

  return (
    <motion.div layout className="product-card">
      <div className="product-card-image-wrap">
        <button
          className={`product-card-like ${liked ? 'liked' : ''}`}
          onClick={onLikeClick}
          aria-label="Wishlist"
        >
          <FiHeart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
        {isAdmin && (
          <div className="product-card-admin">
            <Link to={`/admin/products/${item.id}/edit`} aria-label="Edit"><FiEdit2 size={13} /></Link>
            <button onClick={onDelete} aria-label="Delete"><FiTrash2 size={13} /></button>
          </div>
        )}
        <Link to={`/products/${item.slug}`} className="product-card-link">
          <img src={getProductImageUrl(item.image_path)} alt={item.name} />
        </Link>
      </div>
      <div className="product-card-name">{item.name}</div>
      <div className="product-card-price serif">${item.price}</div>
      <button className="product-card-add" onClick={() => addItem(item.id)}>
        <FiPlus size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />Add
      </button>
    </motion.div>
  )
}

export default Item
