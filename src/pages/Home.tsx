import AddForm from '../components/AddForm'
import Cart from '../components/Cart'
import EditForm from '../components/EditForm'
import Footer from '../components/Footer'
import Contact from '../components/Contact'
import Header from '../components/Header'
import Items from '../components/Items'
import { useGlobalContext } from '../Context'
import MoreInfoModal from '../components/MoreInfoModal'
import Categories from '../components/Categories'
const Home = () => {
    const {showAddForm,editForm, displayCart,showInfoModal} = useGlobalContext()
  return (
    <div>
        <Header />
        <Items />
        {showInfoModal && <MoreInfoModal/>}
        <Categories />
        {editForm && <EditForm />}
        {showAddForm && <AddForm /> }
        {displayCart && <Cart /> }
        <Contact />
        <Footer />
    </div>
  )
}

export default Home
