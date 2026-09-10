import Cart from '../components/Cart'
import Footer from '../components/Footer'
import Contact from '../components/Contact'
import Header from '../components/Header'
import Items from '../components/Items'
import { useUIContext } from '../context/UIContext'
import Categories from '../components/Categories'
const Home = () => {
    const {isCartOpen} = useUIContext()
  return (
    <div>
        <Header />
        <Items />
        <Categories />
        {isCartOpen && <Cart /> }
        <Contact />
        <Footer />
    </div>
  )
}

export default Home
