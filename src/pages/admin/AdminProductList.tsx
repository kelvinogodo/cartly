import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useDeleteProduct } from '../../hooks/useProductMutations'
import { getProductImageUrl } from '../../lib/images'
import { formatPrice } from '../../lib/format'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../context/ToastContext'
import AdminShell from './AdminShell'

const AdminProductList = () => {
  useDocumentTitle('Admin · Products')
  const toast = useToast()
  const { data: products, isLoading, error } = useProducts()
  const deleteProduct = useDeleteProduct()

  const onDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This can't be undone.`)) {
      deleteProduct.mutate(id, {
        onSuccess: () => toast.show({ title: 'Product deleted' }),
        onError: (e) => toast.show({ title: 'Could not delete', description: e.message, tone: 'error' }),
      })
    }
  }

  return (
    <AdminShell>
      <section className="admin-page">
        <div className="admin-toprow">
          <h1 className="serif" style={{ fontSize: 26 }}>Products</h1>
          <Link to="/admin/products/new" className="btn-primary">+ Add product</Link>
        </div>

        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--text-muted)' }}>Could not load products.</p>}

        <div className="admin-table-head">
          <div style={{ width: 48 }} />
          <div style={{ flex: 1 }}>Name</div>
          <div style={{ width: 90 }}>Price</div>
          <div style={{ width: 70 }}>Stock</div>
          <div style={{ width: 90 }}>Featured</div>
          <div style={{ width: 100 }} />
        </div>

        {products?.map((product) => (
          <div className="admin-row" key={product.id}>
            <div className="admin-row-thumb">
              <img src={getProductImageUrl(product.image_path)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="admin-row-name">{product.name}</div>
            <div className="admin-row-price serif" style={{ width: 90 }}>{formatPrice(product.price)}</div>
            <div style={{ width: 70, fontSize: 13 }}>{product.stock}</div>
            <div style={{ width: 90, fontSize: 13, color: product.is_featured ? 'var(--accent)' : 'var(--text-faint)' }}>{product.is_featured ? 'Yes' : 'No'}</div>
            <div className="admin-row-actions">
              <Link to={`/admin/products/${product.id}/edit`}>Edit</Link>
              <button className="danger" onClick={() => onDelete(product.id, product.name)}>Delete</button>
            </div>
          </div>
        ))}
      </section>
    </AdminShell>
  )
}

export default AdminProductList
