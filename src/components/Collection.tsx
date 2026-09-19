import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiSearch, FiX } from 'react-icons/fi'
import { useCategories } from '../hooks/useCategories'
import { useCatalog } from '../hooks/useCatalog'
import { PAGE_SIZE, SORT_OPTIONS, pageCount, parsePrice, type SortKey } from '../lib/catalog'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useUIContext } from '../context/UIContext'
import { ProductCard } from './ProductCard'
import { SectionHead } from './ui/SectionHead'
import { ProductGridSkeleton } from './ui/ProductGridSkeleton'

const Collection = () => {
  const { categoryFilter, setCategoryFilter, searchTerm, setSearchTerm } = useUIContext()
  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300)
  const { data: categories } = useCategories()
  const [sort, setSort] = useState<SortKey>('newest')
  const [minInput, setMinInput] = useState('')
  const [maxInput, setMaxInput] = useState('')
  const minPrice = parsePrice(useDebouncedValue(minInput, 400))
  const maxPrice = parsePrice(useDebouncedValue(maxInput, 400))
  const [page, setPage] = useState(0)

  // Any change to what is being listed starts again from the first page.
  useEffect(() => setPage(0), [categoryFilter, debouncedSearch, sort, minPrice, maxPrice])

  const { data, isLoading, isPlaceholderData, error } = useCatalog({
    categoryId: categoryFilter,
    search: debouncedSearch,
    sort,
    minPrice,
    maxPrice,
    page,
  })
  const products = data?.products
  const total = data?.total ?? 0
  const pages = pageCount(total, PAGE_SIZE)

  const goToPage = (next: number) => {
    setPage(next)
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeCategory = categories?.find((c) => c.id === categoryFilter)
  const filtered = categoryFilter !== null || debouncedSearch !== '' || minPrice !== null || maxPrice !== null

  const clearFilters = () => {
    setCategoryFilter(null)
    setSearchTerm('')
    setMinInput('')
    setMaxInput('')
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

      <div className="toolbar">
        <div className="price-filter" role="group" aria-label="Filter by price">
          <span>Price</span>
          <input type="number" inputMode="decimal" min={0} placeholder="Min" aria-label="Minimum price" value={minInput} onChange={(e) => setMinInput(e.target.value)} />
          <span aria-hidden>–</span>
          <input type="number" inputMode="decimal" min={0} placeholder="Max" aria-label="Maximum price" value={maxInput} onChange={(e) => setMaxInput(e.target.value)} />
        </div>
        <label className="sort-select">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
      </div>

      {(debouncedSearch || (products && !isLoading)) && (
        <p className="results-note" aria-live="polite">
          {debouncedSearch ? `Results for “${debouncedSearch}” · ` : ''}
          {total} {total === 1 ? 'piece' : 'pieces'}
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

      {pages > 1 && (
        <nav className="pager" aria-label="Collection pages">
          <button className="pager-btn" onClick={() => goToPage(page - 1)} disabled={page === 0} aria-label="Previous page">
            <FiChevronLeft size={16} />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={`pager-btn ${i === page ? 'is-active' : ''}`}
              onClick={() => goToPage(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))}
          <button className="pager-btn" onClick={() => goToPage(page + 1)} disabled={page >= pages - 1} aria-label="Next page">
            <FiChevronRight size={16} />
          </button>
        </nav>
      )}
    </section>
  )
}

export default Collection
