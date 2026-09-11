import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'

const CategoryTiles = () => {
  const { data: categories } = useCategories()
  const { setCategoryFilter } = useUIContext()
  const navigate = useNavigate()

  if (!categories || categories.length === 0) return null

  const goToCategory = (categoryId: string) => {
    setCategoryFilter(categoryId)
    navigate('/')
    document.getElementById('shop-the-collection')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <h2 className="section-heading serif">Shop by category</h2>
      <div className="category-tiles">
        {categories.map((category) => (
          <button
            key={category.id}
            className="category-tile"
            onClick={() => goToCategory(category.id)}
            style={{ border: 'none', textAlign: 'left', font: 'inherit' }}
          >
            <span className="category-tile-label serif">{category.name}</span>
          </button>
        ))}
      </div>
    </>
  )
}

export default CategoryTiles
