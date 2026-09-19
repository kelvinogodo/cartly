import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAdminOrders } from '../../hooks/useAdminOrders'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatPrice } from '../../lib/format'
import AdminShell from './AdminShell'

const LOW_STOCK = 5

const AdminDashboard = () => {
  useDocumentTitle('Admin')
  const { data: products } = useProducts()
  const { data: orders } = useAdminOrders()

  const pending = orders?.filter((o) => o.status === 'pending').length
  // cancelled orders never count as revenue
  const revenue = orders?.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0)
  const lowStock = products?.filter((p) => p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock)

  return (
    <AdminShell>
      <section className="admin-page">
        <h1 className="serif" style={{ fontSize: 26, marginBottom: 28 }}>Overview</h1>

        <div className="admin-stats">
          <div className="admin-stat">
            <div className="admin-stat-label">Products</div>
            <div className="admin-stat-value serif">{products?.length ?? '—'}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Orders awaiting action</div>
            <div className="admin-stat-value serif">{pending ?? '—'}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Revenue (excl. cancelled)</div>
            <div className="admin-stat-value serif">{revenue === undefined ? '—' : formatPrice(revenue)}</div>
          </div>
        </div>

        <h2 className="serif" style={{ fontSize: 20, marginBottom: 14 }}>Low stock</h2>
        {lowStock && lowStock.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Everything is well stocked.</p>}
        {lowStock?.map((p) => (
          <div className="admin-row" key={p.id}>
            <div className="admin-row-name">{p.name}</div>
            <div style={{ fontSize: 13, color: p.stock === 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</div>
            <div className="admin-row-actions"><Link to={`/admin/products/${p.id}/edit`}>Restock</Link></div>
          </div>
        ))}
      </section>
    </AdminShell>
  )
}

export default AdminDashboard
