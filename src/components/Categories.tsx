import {motion,AnimatePresence} from 'framer-motion'
import { useGlobalContext } from '../Context'
import Item from './Item'
import StickyHeader from './StickyHeader'
const Categories = () => {
    const {filtered,deleteItem} = useGlobalContext()
  return (
    <section className='category-section'>
      <StickyHeader categories={[
        {
          id:1,
          title:'all'
        },
        {
          id:2,
          title:'men'
        },
        {
          id:3,
          title:'shoe'
        },
        {
          id:4,
          title:'women'
        },
        {
          id:5,
          title:'handbag'
        }
        ] } text={'sort by category'}/>
      <motion.div layout animate={{opacity:1}} initial={{opacity:0}} exit={{opacity:0}}  className='items-container category-container'>
        <AnimatePresence >
          {filtered.map((item: any) =>(<Item key={item.id} item= {item} onDelete={()=>deleteItem(item.id)} />))  }
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

export default Categories
