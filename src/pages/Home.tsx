import Footer from '../components/Footer'
import Contact from '../components/Contact'
import Header from '../components/Header'
import Items from '../components/Items'
import CategoryTiles from '../components/CategoryTiles'
import Categories from '../components/Categories'
const Home = () => {
  return (
    <div>
        <Header />
        <Items />
        <CategoryTiles />
        <Categories />
        <Contact />
        <Footer />
    </div>
  )
}

export default Home
