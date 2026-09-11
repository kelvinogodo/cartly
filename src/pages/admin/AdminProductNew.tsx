import { Link } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductForm from './ProductForm'

const AdminProductNew = () => (
  <div>
    <Header />
    <div className="admin-header">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span className="logo">Cartly</span>
        <span className="admin-badge">Admin</span>
      </div>
      <Link to="/admin/products" style={{ fontSize: 13, textDecoration: 'underline' }}>← Back to products</Link>
    </div>
    <ProductForm />
    <Footer />
  </div>
)

export default AdminProductNew
