import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Products', end: false },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
  { to: '/admin/errors', label: 'Errors', end: false },
]

/** Shared chrome for every admin screen: badge + section tabs. */
const AdminShell = ({ children }: { children: ReactNode }) => (
  <div>
    <div className="admin-header">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span className="logo">Cartly</span>
        <span className="admin-badge">Admin</span>
      </div>
      <nav className="admin-tabs" aria-label="Admin sections">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `admin-tab ${isActive ? 'is-active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
    {children}
  </div>
)

export default AdminShell
