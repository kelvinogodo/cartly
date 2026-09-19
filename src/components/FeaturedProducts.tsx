import { FiArrowRight } from 'react-icons/fi'
import { useFeaturedProducts } from '../hooks/useFeaturedProducts'
import { useUIContext } from '../context/UIContext'
import { ProductCard } from './ProductCard'
import { SectionHead } from './ui/SectionHead'
import { ProductGridSkeleton } from './ui/ProductGridSkeleton'

const FeaturedProducts = () => {
  const { data: products, isLoading } = useFeaturedProducts()
  const { setCategoryFilter } = useUIContext()

  if (!isLoading && (!products || products.length === 0)) return null

  const viewAll = () => {
    setCategoryFilter(null)
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="section" aria-labelledby="featured-title">
      <SectionHead
        id="featured-title"
        eyebrow="Featured"
        title="Pieces we keep coming back to"
        action={
          <button className="link-underline desktop-only" onClick={viewAll}>
            View all <FiArrowRight size={14} />
          </button>
        }
      />
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <div className="pgrid">
          {products?.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      )}
    </section>
  )
}

export default FeaturedProducts
