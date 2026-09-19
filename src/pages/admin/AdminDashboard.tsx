import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'

const AdminDashboard = () => {
  const { data: products } = useProducts()

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="logo">Cartly</span>
          <span className="admin-badge">Admin</span>
        </div>
      </div>

      <section className="admin-page">
        <h1 className="serif" style={{ fontSize: 26, marginBottom: 28 }}>Dashboard</h1>

        <div className="admin-stats">
          <div className="admin-stat">
            <div className="admin-stat-label">Products</div>
            <div className="admin-stat-value serif">{products?.length ?? '—'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
          <Link to="/admin/products" style={{ border: '1px solid var(--text)', padding: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="serif" style={{ fontSize: 18 }}>Manage products</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add, edit, and remove catalog listings, including image uploads.</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
