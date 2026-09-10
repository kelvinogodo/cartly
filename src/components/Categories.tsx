import {motion,AnimatePresence} from 'framer-motion'
import { useUIContext } from '../context/UIContext'
import { useProducts } from '../hooks/useProducts'
import Item from './Item'
import StickyHeader from './StickyHeader'
const Categories = () => {
    const {categoryFilter,searchTerm} = useUIContext()
    const {data: products, isLoading, error} = useProducts({categoryId: categoryFilter, search: searchTerm})
  return (
    <section className='category-section'>
      <StickyHeader text={'sort by category'}/>
      <motion.div layout animate={{opacity:1}} initial={{opacity:0}} exit={{opacity:0}}  className='items-container category-container'>
        {isLoading && <p>loading products...</p>}
        {error && <p>could not load products.</p>}
        <AnimatePresence >
          {products?.map((item) =>(<Item key={item.id} item= {item} />))  }
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

export default Categories
