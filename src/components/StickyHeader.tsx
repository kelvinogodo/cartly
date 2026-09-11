import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'

const StickyHeader = ({text}: {text: string}) => {
    const { data: categories } = useCategories()
    const { categoryFilter, setCategoryFilter } = useUIContext()

  return (
    <div>
      <h2 className="section-heading serif" id="shop-the-collection">{text}</h2>
      <nav className="category-nav">
        <button className={categoryFilter === null ? 'active' : ''} onClick={() => setCategoryFilter(null)}>All</button>
        {categories?.map((category) => (
          <button
            key={category.id}
            className={categoryFilter === category.id ? 'active' : ''}
            onClick={() => setCategoryFilter(category.id)}
          >
            {category.name}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default StickyHeader
