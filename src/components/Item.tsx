import { Link, useNavigate } from 'react-router-dom'
import {AiTwotoneHeart} from 'react-icons/ai'
import {motion} from 'framer-motion'
import {MdOutlineAdd} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useUIContext } from '../context/UIContext'
import { useWishlist } from '../hooks/useWishlist'
import { getProductImageUrl } from '../lib/images'
import type { Product } from '../types/domain'

const Item = ({item}: {item: Product}) => {
  const { user } = useAuth()
  const { addToCart } = useUIContext()
  const { likedIds, toggle } = useWishlist()
  const navigate = useNavigate()
  const liked = likedIds.has(item.id)

  const onLikeClick = () => {
    if (!user) {
      navigate('/login')
      return
    }
    toggle(item.id)
  }

  return (
    <motion.div layout className='item'>
        <AiTwotoneHeart className={liked ? 'liked' : 'unliked'} onClick={onLikeClick}/>
        <Link to={`/products/${item.slug}`}>
          <img src={getProductImageUrl(item.image_path)} alt={item.name} />
        </Link>
        <div className="item-info">
            <p>{item.name}</p>
            <small className='prize'> {`price: $${item.price}`}</small>
        </div>
        <MdOutlineAdd className='add-item-btn' onClick={()=> addToCart(item)} />
    </motion.div>
  )
}

export default Item
