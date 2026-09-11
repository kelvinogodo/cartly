import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductForm from './ProductForm'
import { useProductById } from '../../hooks/useProductById'

const AdminProductEdit = () => {
  const { id } = useParams()
  const { data: product, isLoading, error } = useProductById(id)

  return (
    <div>
      <Header />
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="logo">Cartly</span>
          <span className="admin-badge">Admin</span>
        </div>
        <Link to="/admin/products" style={{ fontSize: 13, textDecoration: 'underline' }}>← Back to products</Link>
      </div>
      {isLoading && <p style={{ textAlign: 'center', padding: '60px 0' }}>Loading…</p>}
      {error && <p style={{ textAlign: 'center', padding: '60px 0' }}>Product not found.</p>}
      {product && <ProductForm product={product} />}
      <Footer />
    </div>
  )
}

export default AdminProductEdit
