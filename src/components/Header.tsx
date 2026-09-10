import { useState } from 'react'
import { Link } from 'react-router-dom'
import {BsFillCartCheckFill} from 'react-icons/bs'
import {FaShopify} from 'react-icons/fa'
import SearchItems from './SearchItems'
import { useUIContext } from '../context/UIContext'
import { useAuth } from '../context/AuthContext'
import {FaUserCircle} from 'react-icons/fa'
const Header = () => {
  const {cartItems,openCart} = useUIContext()
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
       <div className="user-menu">
         {user ? (
           <>
             <FaUserCircle className='user-icon icon' onClick={() => setMenuOpen(!menuOpen)}/>
             {menuOpen && (
               <div className="user-menu-dropdown">
                 <small>{profile?.full_name || user.email}</small>
                 {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>admin</Link>}
                 <button onClick={() => { setMenuOpen(false); signOut(); }}>log out</button>
               </div>
             )}
           </>
         ) : (
           <Link to="/login"><FaUserCircle className='user-icon icon'/></Link>
         )}
       </div>
       <BsFillCartCheckFill className='head-cart icon' onClick={openCart}/>
       </div>
   </header>
  )
}

export default Header
