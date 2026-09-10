import {AiOutlineClose} from 'react-icons/ai'
import {motion,AnimatePresence} from 'framer-motion'
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// import "./styles.css";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import {FaShopify} from 'react-icons/fa'
import { useUIContext } from '../context/UIContext';
import { getProductImageUrl } from '../lib/images';
const Cart = () => {
  const {cartItems,cartTotal,closeCart,removeFromCart} = useUIContext()
  return (
    <AnimatePresence>
    <motion.div animate={{opacity:1}} initial={{opacity:0}} exit={{opacity:0}} className='cart'>
        <AiOutlineClose className="close" onClick={closeCart}/>
        <div className="cart-list">
        <div className='form-header'>
                 <small className='logo'>
                    cartly <FaShopify />
                 </small>
        </div>
        <small className='prize-badge'>total = {`$${cartTotal}`}</small>
        {cartItems.length === 0 ? (
          <p>your cart is empty</p>
        ) : (
        <Swiper
        pagination={{
          dynamicBullets: true,
        }}
        modules={[Pagination]}
        className="mySwiper swiper-container"
      >
        {cartItems.map((cartItem) =>(
        <SwiperSlide key={cartItem.productId} className='cart-slide'>
        <AiOutlineClose className="delete-item-btn"onClick={()=>removeFromCart(cartItem.productId)} />
            <img src={getProductImageUrl(cartItem.product.image_path)} alt={cartItem.product.name} className='item-pic' />
            <div className="item-info">
                      <p>available colors: <small><b>{cartItem.product.color}</b></small></p>
                      <p>size: <small><b>{cartItem.product.size}</b></small></p>
                      <p>made in: <small><b>{cartItem.product.made_in}</b></small></p>
                      <p>quantity: <small><b>{cartItem.quantity}</b></small></p>
                      <p>price: <small><b>${cartItem.product.price}</b></small></p>
                  </div>
        </SwiperSlide>
        ))}
      </Swiper>
      )}
      <button className='check-out-btn' type='submit' disabled={cartItems.length === 0}>check out</button>
        </div>
    </motion.div>
    </AnimatePresence>
  )
}

export default Cart
