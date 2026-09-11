import { useState } from 'react'
import { Link } from 'react-router-dom'
import {BsFillCartCheckFill} from 'react-icons/bs'
import {GrAdd} from 'react-icons/gr'
import {FaShopify} from 'react-icons/fa'
import SearchItems from './SearchItems'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import {FaUserCircle} from 'react-icons/fa'
const Header = () => {
  const {items: cartItems} = useCart()
  const {user,profile,isAdmin,signOut} = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
   <header>
       <Link to="/" style={{textDecoration: 'none'}}>
         <small className="logo">
           <FaShopify className='logo'/>
           cartly
         </small>
       </Link>
       <SearchItems/>
       <div className="header-btn-container">
         {cartItems.length !== 0 && <small className="item-number">
           {cartItems.length}
         </small>}
       {isAdmin && <Link to="/admin/products/new"><GrAdd className='add-btn icon'/></Link>}
       <div className="user-menu">
         {user ? (
           <>
             <FaUserCircle className='user-icon icon' onClick={() => setMenuOpen(!menuOpen)}/>
             {menuOpen && (
               <div className="user-menu-dropdown">
                 <small>{profile?.full_name || user.email}</small>
                 <Link to="/account" onClick={() => setMenuOpen(false)}>my orders</Link>
                 {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>admin</Link>}
                 <button onClick={() => { setMenuOpen(false); signOut(); }}>log out</button>
               </div>
             )}
           </>
         ) : (
           <Link to="/login"><FaUserCircle className='user-icon icon'/></Link>
         )}
       </div>
       <Link to="/cart"><BsFillCartCheckFill className='head-cart icon'/></Link>
       </div>
   </header>
  )
}

export default Header
