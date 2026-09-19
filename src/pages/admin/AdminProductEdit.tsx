import { useParams } from 'react-router-dom'
import ProductForm from './ProductForm'
import AdminShell from './AdminShell'
import { useProductById } from '../../hooks/useProductById'

const AdminProductEdit = () => {
  const { id } = useParams()
  const { data: product, isLoading, error } = useProductById(id)

  return (
    <AdminShell>
      {isLoading && <p style={{ textAlign: 'center', padding: '60px 0' }}>Loading…</p>}
      {error && <p style={{ textAlign: 'center', padding: '60px 0' }}>Product not found.</p>}
      {product && <ProductForm product={product} />}
    </AdminShell>
  )
}

export default AdminProductEdit
