import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiSearch, FiUser, FiShoppingBag } from 'react-icons/fi'
import SearchItems from './SearchItems'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'

const Header = () => {
  const { items: cartItems } = useCart()
  const { user, profile, isAdmin, signOut } = useAuth()
  const { data: categories } = useCategories()
  const { categoryFilter, setCategoryFilter } = useUIContext()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const goToCategory = (categoryId: string | null) => {
    setCategoryFilter(categoryId)
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header>
      <div className="announcement-bar">Complimentary returns, always</div>

      <div className="site-header">
        <button className="header-icon-btn mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <nav className="nav-links desktop-only">
          <button className={categoryFilter === null ? 'active' : ''} onClick={() => goToCategory(null)}>All</button>
          {categories?.map((category) => (
            <button
              key={category.id}
              className={categoryFilter === category.id ? 'active' : ''}
              onClick={() => goToCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </nav>

        <Link to="/" className="logo" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
          <span className="logo">Cartly</span>
        </Link>

        <div className="header-icons">
          <button className="header-icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <FiSearch size={18} />
          </button>
          <div style={{ position: 'relative' }}>
            {user ? (
              <button className="header-icon-btn" onClick={() => setAccountMenuOpen(!accountMenuOpen)} aria-label="Account">
                <FiUser size={18} color={isAdmin ? 'var(--accent)' : undefined} />
              </button>
            ) : (
              <Link to="/login" className="header-icon-btn" aria-label="Account">
                <FiUser size={18} />
              </Link>
            )}
            {accountMenuOpen && user && (
              <div className="user-menu-dropdown">
                <small>{profile?.full_name || user.email}</small>
                <Link to="/account" onClick={() => setAccountMenuOpen(false)}>My orders</Link>
                {isAdmin && <Link to="/admin" onClick={() => setAccountMenuOpen(false)}>Admin</Link>}
                <button onClick={() => { setAccountMenuOpen(false); signOut(); }}>Log out</button>
              </div>
            )}
          </div>
          <Link to="/cart" className="header-icon-btn icon-wrap" aria-label="Bag">
            <FiShoppingBag size={18} />
            {cartItems.length !== 0 && <span className="cart-badge">{cartItems.length}</span>}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="mobile-menu">
          <SearchItems />
        </div>
      )}

      {menuOpen && (
        <div className="mobile-menu">
          <button onClick={() => goToCategory(null)}>All</button>
          {categories?.map((category) => (
            <button key={category.id} onClick={() => goToCategory(category.id)}>{category.name}</button>
          ))}
          {isAdmin && <Link to="/admin/products/new" onClick={() => setMenuOpen(false)}>Add product</Link>}
        </div>
      )}
    </header>
  )
}

export default Header
