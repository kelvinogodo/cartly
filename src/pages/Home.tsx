import Hero from '../components/Hero'
import CategoryTiles from '../components/CategoryTiles'
import FeaturedProducts from '../components/FeaturedProducts'
import Collection from '../components/Collection'
import Story from '../components/Story'
import { useEffect } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { scrollToId, takePendingScroll } from '../lib/scroll'

const Home = () => {
  useDocumentTitle()
  useEffect(() => {
    const target = takePendingScroll()
    if (target) window.setTimeout(() => scrollToId(target), 350)
  }, [])
  return (
    <div>
      <main>
        <Hero />
        <CategoryTiles />
        <FeaturedProducts />
        <Collection />
        <Story />
      </main>
    </div>
  )
}

export default Home
