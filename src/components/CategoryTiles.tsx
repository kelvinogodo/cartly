import { FiArrowRight } from 'react-icons/fi'
import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'
import { Reveal } from './ui/Reveal'
import { SectionHead } from './ui/SectionHead'

const CategoryTiles = () => {
  const { data: categories } = useCategories()
  const { setCategoryFilter } = useUIContext()

  if (!categories || categories.length === 0) return null

  const shop = (categoryId: string) => {
    setCategoryFilter(categoryId)
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="section" aria-labelledby="categories-title">
      <SectionHead id="categories-title" eyebrow="Browse" title="Shop by category" />
      <div className="ctiles">
        {categories.map((category, index) => (
          <Reveal key={category.id} delay={index * 0.08}>
            <button className="ctile" onClick={() => shop(category.id)} aria-label={`Shop ${category.name}`}>
              {category.image_path && <img src={category.image_path} alt="" loading="lazy" decoding="async" width={720} height={900} />}
              <span className="ctile-label">
                <span>{category.name}</span>
                <FiArrowRight className="ctile-arrow" size={20} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default CategoryTiles
