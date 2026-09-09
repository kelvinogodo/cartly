import React from 'react'
import {AiOutlineClose} from 'react-icons/ai'
import {motion,AnimatePresence} from 'framer-motion'
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// import "./styles.css";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import {FaShopify} from 'react-icons/fa'
import { useContext } from 'react';
import GlobalContext from '../Context';
const Cart = () => {
  const {carts,total,closeDisplayCart,deleteCartItem} = useContext(GlobalContext)
  return (
    <AnimatePresence>
    <motion.div animate={{opacity:1}} initial={{opacity:0}} exit={{opacity:0}} className='cart'>
        <AiOutlineClose className="close" onClick={closeDisplayCart}/>
        <div className="cart-list">
        <div className='form-header'>
                 <small className='logo'>
                    shopper <FaShopify />
                 </small>
        </div>
        <small className='prize-badge'>total = {`$${total}`}</small>
        <Swiper
        pagination={{
          dynamicBullets: true,
        }}
        modules={[Pagination]}
        className="mySwiper swiper-container"
      >
        {carts.map(cart =>(carts !== [] ? <SwiperSlide className='cart-slide'>
        <AiOutlineClose className="delete-item-btn"onClick={()=>deleteCartItem(cart.id,cart.prize)} />
            <img src={`images/${cart.image}`} alt="" className='item-pic' key={cart.id} />
            <div className="item-info">
                      <p>available colors: <small><b>{cart.color}</b></small></p>
                      <p>size: <small><b>{cart.size}</b></small></p>
                      <p>made in: <small><b>{cart.madeIn}</b></small></p>
                      <p>category: <small><b>{cart.category}</b></small></p>
                      <p>prize: <small><b>${cart.prize}</b></small></p>
                  </div>
        </SwiperSlide > : closeDisplayCart))}
      </Swiper>
      <button className='check-out-btn' type='submit'>check out</button>
        </div>  
    </motion.div>
    </AnimatePresence>
  )
}

export default Cart