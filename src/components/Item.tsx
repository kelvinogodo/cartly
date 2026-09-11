import { Link, useNavigate } from 'react-router-dom'
import {AiOutlineDelete} from 'react-icons/ai'
import {MdOutlineModeEdit} from 'react-icons/md'
import {AiTwotoneHeart} from 'react-icons/ai'
import {motion} from 'framer-motion'
import {MdOutlineAdd} from 'react-icons/md'
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
    <motion.div layout className='item'>
        <AiTwotoneHeart className={liked ? 'liked' : 'unliked'} onClick={onLikeClick}/>
        {isAdmin && (
          <div className='item-btn-container'>
            <AiOutlineDelete className="delete-btn" onClick={onDelete} />
            <Link to={`/admin/products/${item.id}/edit`}><MdOutlineModeEdit className='edit-btn' /></Link>
          </div>
        )}
        <Link to={`/products/${item.slug}`}>
          <img src={getProductImageUrl(item.image_path)} alt={item.name} />
        </Link>
        <div className="item-info">
            <p>{item.name}</p>
            <small className='prize'> {`price: $${item.price}`}</small>
        </div>
        <MdOutlineAdd className='add-item-btn' onClick={()=> addItem(item.id)} />
    </motion.div>
  )
}

export default Item
