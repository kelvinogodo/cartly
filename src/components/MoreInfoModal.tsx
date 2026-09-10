import {motion,AnimatePresence} from 'framer-motion'
import { useGlobalContext } from '../Context'
import {BsFillArrowLeftCircleFill} from 'react-icons/bs'
import {MdOutlineAdd} from 'react-icons/md'
import {AiTwotoneHeart} from 'react-icons/ai'
const MoreInfoModal = () => {
    const {closeInfoModal,active,checkId,like} = useGlobalContext()
  return (

    <motion.section animate={{opacity:1}} initial={{opacity:0}} exit={{opacity:0}} className='add-form-container more-info-add'>
      <AnimatePresence>
            <div className='more-info-card'>
              <BsFillArrowLeftCircleFill className='more-info-close-btn close-btn' onClick={closeInfoModal}/>
                <motion.div layout className='item more-info-item'>
                  <AiTwotoneHeart className={active.liked ? 'liked' : 'unliked'} onClick={()=>like(active.id)}/>
                  <div className='item-btn-container'>
                  </div>
                  <img src={`images/${active.image}`} alt="" />
                  <div className="item-info">
                      <p>{active.name}</p>
                      <small className='prize'> {`prize: $ ${active.prize}`}</small>
                  </div>

              </motion.div>
              <motion.div layout className='item more-info-item second'>
                  <div className="item-info">
                      <p>available colors: <small><b>{active.color}</b></small></p>
                      <p>size: <small><b>{active.size}</b></small></p>
                      <p>made in: <small><b>{active.madeIn}</b></small></p>
                      <p>category: <small><b>{active.category}</b></small></p>
                  </div>
                  <MdOutlineAdd className='add-item-btn' onClick={()=> checkId({id:active.id,name:active.name,prize:active.prize,image:active.image})
                  } />
              </motion.div>
            </div>
      </AnimatePresence>
    </motion.section>
  )
}

export default MoreInfoModal
