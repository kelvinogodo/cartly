import React from 'react'
import Item from './Item'
import { Swiper, SwiperSlide } from "swiper/react";
import { useContext } from 'react'
import GlobalContext from '../Context'
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import PopularCategory from './PopularCategory';
// import "./styles.css";
import { Pagination } from "swiper/modules";
const Items = () => {
  const {deleteItem,items} = useContext(GlobalContext)
  return (
    <main>
      <div className='landpage'>
      <Swiper
        pagination={{
          dynamicBullets: true,
        }}
        modules={[Pagination]}
        className="mySwiper swiper-container"
      >
        <SwiperSlide className='slide'>
          <div className="land-text">
            <h5>
              suit up!  and and focus on being a better man, every day. 
            </h5>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consequatur sunt obcaecati autem pariatur soluta doloribus recusandae veniam harum assumenda?</p>
            <button>explore</button>
          </div>
          <div className="slider-img-container">
            <img src='images/preview (2).png' alt="" className='slider-img' />
          </div>
        </SwiperSlide>
        <SwiperSlide className='slide'>
          <div className="slider-img-container">
            <img src='images/preview (5).png' alt="" className='slider-img' />
          </div>
          <div className="land-text">
              <h5>
              get most comfortable shoes at cartly
              </h5>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consequatur sunt obcaecati autem pariatur soluta doloribus recusandae veniam harum assumenda?</p>
              <button>explore</button>
          </div>
        </SwiperSlide>
        <SwiperSlide className='slide'>
          <div className="land-text">
            <h5>
              check out our amazing ladies footwear collection
            </h5>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consequatur sunt obcaecati autem pariatur soluta doloribus recusandae veniam harum assumenda?</p>
            <button>explore</button>
          </div>
          <div className="slider-img-container">
          <img src='images/preview (3).png' alt="" className='slider-img' />
          </div>
        </SwiperSlide >
        <SwiperSlide className='slide'>
          <div className="slider-img-container">
              <img src='images/preview (1).png' alt="" className='slider-img' />
            </div>
            <div className="land-text">
                <h5>
                get most comfortable shoes at cartly
                </h5>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consequatur sunt obcaecati autem pariatur soluta doloribus recusandae veniam harum assumenda?</p>
                <button>explore</button>
            </div>
        </SwiperSlide>
        <SwiperSlide className='slide'>
          <div className="land-text">
            <h5>
              check out our amazing ladies footwear collection
            </h5>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui consequatur sunt obcaecati autem pariatur soluta doloribus recusandae veniam harum assumenda?</p>
            <button>explore</button>
          </div>
          <div className="slider-img-container">
            <img src='images/preview (4).png' alt="" className='slider-img' />
          </div>
        </SwiperSlide >
      </Swiper>
      </div>
      <PopularCategory />
    </main>
  )
}

export default Items