import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link, useNavigate } from 'react-router-dom'

import {MdOutlineAdd} from 'react-icons/md'
import {AiTwotoneHeart} from 'react-icons/ai'

// import required modules
import { Pagination } from "swiper/modules";
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

  return (
    <>

        <Swiper
        slidesPerView={3}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper popular-swiper"
      >
        {products?.map((item)=>(
        <SwiperSlide key={item.id} className='item popular-item' style={{width:'200px'}}>
            <AiTwotoneHeart className={likedIds.has(item.id) ? 'liked' : 'unliked'} onClick={()=>onLikeClick(item.id)}/>
            <Link to={`/products/${item.slug}`}>
              <img src={getProductImageUrl(item.image_path)} alt={item.name} />
            </Link>
            <div className="item-info">
                <p>{item.name}</p>
                <small className='prize'> {`price: $${item.price}`}</small>
            </div>
            <MdOutlineAdd className='add-item-btn' onClick={()=> addItem(item.id)} />
        </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default PopularCategory
