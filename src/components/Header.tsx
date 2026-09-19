import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiHeart, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from 'react-icons/fi'
import SearchItems from './SearchItems'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'
import { useScrollToSection } from '../hooks/useScrollToSection'

const panelMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.32, ease: [0.22, 0.8, 0.24, 1] as [number, number, number, number] },
}

// Keyed by value so each change remounts a single badge that "pops" in — never
// two badges at once (which would also read twice to a screen reader).
const CountBadge = ({ value }: { value: number }) =>
  value > 0 ? (
    <motion.span
      key={value}
      className="badge"
      initial={{ scale: 1.9, opacity: 0.4 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 16 }}
    >
      {value}
    </motion.span>
  ) : null

const Header = () => {
  const { count: bagCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user, profile, isAdmin, signOut } = useAuth()
  const { data: categories } = useCategories()
  const { categoryFilter, setCategoryFilter } = useUIContext()
  const location = useLocation()
  const scrollToSection = useScrollToSection()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setAccountMenuOpen(false)
  }, [location.pathname])

  const goToCategory = (categoryId: string | null) => {
    setCategoryFilter(categoryId)
    setMenuOpen(false)
    scrollToSection('collection')
  }

  const onHome = location.pathname === '/'

  return (
    <>
      <div className="announcement-bar">Curated fashion, footwear &amp; accessories</div>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="site-header-inner">
          <div className="header-left">
            <button
              className="header-icon-btn mobile-only"
              onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            <nav className="nav-links desktop-only" aria-label="Shop by category">
              {categories?.map((category) => (
                <button
                  key={category.id}
                  className={`nav-link ${onHome && categoryFilter === category.id ? 'is-active' : ''}`}
                  onClick={() => goToCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          <Link to="/" className="logo" aria-label="Cartly — home">Cartly</Link>

          <div className="header-icons">
            <button
              className="header-icon-btn"
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false) }}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <FiSearch size={19} />
            </button>

            <Link to="/wishlist" className="header-icon-btn" aria-label={`Wishlist, ${wishlistCount} saved`}>
              <FiHeart size={19} />
              <CountBadge value={wishlistCount} />
            </Link>

            <div className="desktop-only" style={{ position: 'relative' }}>
              {user ? (
                <button
                  className="header-icon-btn"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-label="Account menu"
                  aria-expanded={accountMenuOpen}
                >
                  <FiUser size={19} color={isAdmin ? 'var(--accent)' : undefined} />
                </button>
              ) : (
                <Link to="/login" className="header-icon-btn" aria-label="Sign in">
                  <FiUser size={19} />
                </Link>
              )}
              {accountMenuOpen && user && (
                <div className="user-menu-dropdown">
                  <small>{profile?.full_name || user.email}</small>
                  <Link to="/account">My orders</Link>
                  <Link to="/wishlist">Wishlist</Link>
                  {isAdmin && <Link to="/admin">Admin</Link>}
                  <button onClick={() => { setAccountMenuOpen(false); signOut() }}>Sign out</button>
                </div>
              )}
            </div>

            <Link to="/cart" className="header-icon-btn" aria-label={`Bag, ${bagCount} items`}>
              <FiShoppingBag size={19} />
              <CountBadge value={bagCount} />
            </Link>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {searchOpen && (
            <motion.div key="search" className="header-panel" {...panelMotion}>
              <div className="header-panel-inner">
                <SearchItems onDone={() => setSearchOpen(false)} />
              </div>
            </motion.div>
          )}
          {menuOpen && (
            <motion.div key="menu" className="header-panel mobile-only" style={{ display: 'block' }} {...panelMotion}>
              <div className="header-panel-inner">
                <button className={`mobile-menu-link ${categoryFilter === null ? 'is-active' : ''}`} onClick={() => goToCategory(null)}>
                  All products
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    className={`mobile-menu-link ${categoryFilter === category.id ? 'is-active' : ''}`}
                    onClick={() => goToCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
                <div className="mobile-menu-divider" />
                <Link className="mobile-menu-link" to="/wishlist">Wishlist</Link>
                {user ? (
                  <>
                    <Link className="mobile-menu-link" to="/account">My orders</Link>
                    {isAdmin && <Link className="mobile-menu-link" to="/admin">Admin</Link>}
                    <button className="mobile-menu-link" onClick={() => { setMenuOpen(false); signOut() }}>Sign out</button>
                  </>
                ) : (
                  <>
                    <Link className="mobile-menu-link" to="/login">Sign in</Link>
                    <Link className="mobile-menu-link" to="/signup">Create account</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

export default Header
