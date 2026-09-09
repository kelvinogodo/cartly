import React from 'react'
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

import { useContext } from 'react';
import GlobalContext from '../Context';
import {MdOutlineAdd} from 'react-icons/md'
import {AiOutlineDelete} from 'react-icons/ai'
import {MdOutlineModeEdit} from 'react-icons/md'
import {AiTwotoneHeart} from 'react-icons/ai'

// import required modules
import { Pagination } from "swiper/modules";
const PopularCategory = () => {
    const {items,like,checkId,showEditForm,openInfoModal,updateActive} = useContext(GlobalContext)
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
        {items.slice(items.length-19,items.length-9).reverse().map((item)=>(
        <SwiperSlide className='item popular-item' style={{width:'200px'}}>
            <AiTwotoneHeart className={item.liked ? 'liked' : 'unliked'} onClick={()=>like(item.id)}/>
            <div className='item-btn-container'>
            <AiOutlineDelete  className="delete-btn" />
            <MdOutlineModeEdit deEdit className='edit-btn' onClick={()=>showEditForm(item.id)} /> 
            </div>
            <img src={`images/${item.image}`} alt="" onClick={()=>{
            openInfoModal()
            updateActive({name:item.name,image:item.image,prize:item.prize,finalPrize:item.finalPrize,color:item.color,madeIn:item.madeIn,size:item.size,id:item.id,liked:item.liked,category:item.category})
            }}/>
            <div className="item-info">
                <p>{item.name}</p>
                <small className='prize'> {`prize: $ ${item.prize}`}</small>
            </div>
            <MdOutlineAdd className='add-item-btn' onClick={()=> checkId({id:item.id,
            name:item.name,prize:item.prize,image:item.image,color:item.color,madeIn:item.madeIn,size:item.size,liked:item.liked,category:item.category})
            } /> 
        </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default PopularCategory