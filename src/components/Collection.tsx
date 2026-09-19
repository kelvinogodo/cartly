import { AnimatePresence, motion } from 'framer-motion'
import { FiSearch, FiX } from 'react-icons/fi'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useUIContext } from '../context/UIContext'
import { ProductCard } from './ProductCard'
import { SectionHead } from './ui/SectionHead'
import { ProductGridSkeleton } from './ui/ProductGridSkeleton'

const Collection = () => {
  const { categoryFilter, setCategoryFilter, searchTerm, setSearchTerm } = useUIContext()
  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300)
  const { data: categories } = useCategories()
  const { data: products, isLoading, isPlaceholderData, error } = useProducts({
    categoryId: categoryFilter,
    search: debouncedSearch,
  })

  const activeCategory = categories?.find((c) => c.id === categoryFilter)
  const filtered = categoryFilter !== null || debouncedSearch !== ''

  const clearFilters = () => {
    setCategoryFilter(null)
    setSearchTerm('')
  }

  return (
    <section className="section" id="collection" aria-labelledby="collection-title">
      <SectionHead id="collection-title" eyebrow="The collection" title={activeCategory ? activeCategory.name : 'Shop everything'} />

      <div className="filters" role="group" aria-label="Filter by category">
        <button className={`chip ${categoryFilter === null ? 'is-active' : ''}`} onClick={() => setCategoryFilter(null)}>
          All
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            className={`chip ${categoryFilter === category.id ? 'is-active' : ''}`}
            onClick={() => setCategoryFilter(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {(debouncedSearch || (products && !isLoading)) && (
        <p className="results-note" aria-live="polite">
          {debouncedSearch ? `Results for “${debouncedSearch}” · ` : ''}
          {products?.length ?? 0} {products?.length === 1 ? 'piece' : 'pieces'}
          {filtered && (
            <>
              {' · '}
              <button className="link-underline" style={{ fontSize: 11 }} onClick={clearFilters}>
                Clear <FiX size={12} />
              </button>
            </>
          )}
        </p>
      )}

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <div className="empty-state">
          <h3>We couldn't load the collection</h3>
          <p>Check your connection and try again.</p>
        </div>
      ) : products && products.length === 0 ? (
        <div className="empty-state">
          <FiSearch size={30} />
          <h3>Nothing matches that</h3>
          <p>Try a different search or browse everything.</p>
          <button className="btn-outline" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <motion.div layout className="pgrid" style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity .25s ease' }}>
          <AnimatePresence>
            {products?.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}

export default Collection
