import { Link } from 'react-router-dom'
import { FaShopify } from 'react-icons/fa'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const AdminDashboard = () => (
  <div>
    <Header />
    <section className='cart-page'>
      <div className='cart-page-list'>
        <div className='form-header'>
          <small className='logo'>
            cartly <FaShopify />
          </small>
        </div>
        <h5>admin dashboard</h5>
        <Link to='/admin/products' className='submit-btn' style={{ textDecoration: 'none', textAlign: 'center', width: '80%' }}>
          manage products
        </Link>
      </div>
    </section>
    <Footer />
  </div>
)

export default AdminDashboard
