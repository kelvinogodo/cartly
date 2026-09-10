import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
// import required modules
import { Pagination } from "swiper/modules";

const StickyHeader = ({text}: {text: string}) => {

    const { data: categories } = useCategories()
    const { categoryFilter, setCategoryFilter } = useUIContext()

  return (
    <div className='sticky-header'>
        <Swiper
           slidesPerView={3}
           spaceBetween={30}
           pagination={{
             clickable: true,
           }}
           modules={[Pagination]}
           className="mySwiper popular-swiper"
          >
        <h5 className='sort-header'>{text}</h5>
        <SwiperSlide className='come'>
          <button className={`category ${categoryFilter === null ? 'active' : ''}`} onClick={()=>setCategoryFilter(null)}>all</button>
        </SwiperSlide>
        {categories?.map(category =>(
            <SwiperSlide key={category.id} className='come'>
             <button className={`category ${categoryFilter === category.id ? 'active' : ''}`} onClick={()=>setCategoryFilter(category.id)}>{category.name}</button>
             </SwiperSlide>
        ))}
        </Swiper>
    </div>
  )
}

export default StickyHeader
