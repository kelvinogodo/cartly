import { useGlobalContext } from '../Context'
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
// import required modules
import { Pagination } from "swiper/modules";

interface Category {
  id: number;
  title: string;
}

const StickyHeader = ({categories,text}: {categories: Category[], text: string}) => {

    const {fallBack,filter} = useGlobalContext()

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
        {categories !== null && categories.map(category =>(
            <SwiperSlide key={category.id} className='come'>
             <button className="category" onClick={()=>{
                switch (category.title) {
                    case 'all':
                        fallBack()
                        break;
                        case 'men':
                            filter('men')
                        break;
                        case 'shoe':
                            filter('shoe')
                        break;
                        case 'women':
                            filter('women')
                        break;
                        case 'handbag':
                            filter('handbag')
                        break;
                    default:
                        break;
                }
                }} >{category.title}</button>
             </SwiperSlide>
        ))}
        </Swiper>
    </div>
  )
}

export default StickyHeader
