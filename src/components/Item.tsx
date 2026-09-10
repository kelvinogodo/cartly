import {AiOutlineDelete} from 'react-icons/ai'
import {MdOutlineModeEdit} from 'react-icons/md'
import {AiTwotoneHeart} from 'react-icons/ai'
import {motion} from 'framer-motion'
import {MdOutlineAdd} from 'react-icons/md'
import { useGlobalContext } from '../Context'
const Item = ({item,onDelete}: {item: any, onDelete: () => void}) => {
  const {like,checkId,showEditForm,openInfoModal,updateActive} = useGlobalContext()
  return (
    <motion.div layout className='item'>
        <AiTwotoneHeart className={item.liked ? 'liked' : 'unliked'} onClick={()=>like(item.id)}/>
        <div className='item-btn-container'>
          <AiOutlineDelete  className="delete-btn" onClick={onDelete} />
          <MdOutlineModeEdit className='edit-btn' onClick={()=>showEditForm(item.id)} />
        </div>
        <img src={`images/${item.image}`} alt="" onClick={()=>{
          openInfoModal()
          updateActive({name:item.name,image:item.image,prize:item.prize,finalPrize:item.finalPrize,color:item.color,madeIn:item.madeIn,size:item.size,id:item.id,liked:item.liked,category:item.category})
        }}/>
        <div className="item-info">
            <p>{item.name}</p>
            <small className='prize'> {`prize: $ ${item.prize}`}</small>
        </div>
        <MdOutlineAdd className='add-item-btn' onClick={()=> checkId({id:item.id,name:item.name,prize:item.prize,image:item.image,color:item.color,madeIn:item.madeIn,size:item.size,category:item.category})
        } />
    </motion.div>
  )
}

export default Item
