import {motion,AnimatePresence} from 'framer-motion'
import { useUIContext } from '../context/UIContext'
import { useProducts } from '../hooks/useProducts'
import Item from './Item'
import StickyHeader from './StickyHeader'
const Categories = () => {
    const {categoryFilter,searchTerm} = useUIContext()
    const {data: products, isLoading, error} = useProducts({categoryId: categoryFilter, search: searchTerm})
  return (
    <section>
      <StickyHeader text={'Shop the collection'}/>
      {isLoading && <p style={{textAlign:'center', padding:'40px 0', color:'var(--text-muted)'}}>Loading products…</p>}
      {error && <p style={{textAlign:'center', padding:'40px 0', color:'var(--text-muted)'}}>Could not load products.</p>}
      {products && products.length === 0 && !isLoading && (
        <p style={{textAlign:'center', padding:'40px 0', color:'var(--text-muted)'}}>No products found.</p>
      )}
      <motion.div layout className="product-grid">
        <AnimatePresence>
          {products?.map((item) =>(<Item key={item.id} item= {item} />))  }
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

export default Categories
