import { useState } from 'react'
import { Link } from 'react-router-dom'
import {BsFillCartCheckFill} from 'react-icons/bs'
import {GrAdd} from 'react-icons/gr'
import {FaShopify} from 'react-icons/fa'
import SearchItems from './SearchItems'
import { useGlobalContext } from '../Context'
import { useAuth } from '../context/AuthContext'
import {FaUserCircle} from 'react-icons/fa'
const Header = () => {
  const {carts,showForm,toggleCartDisplay} = useGlobalContext()
  const {user,profile,isAdmin,signOut} = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
   <header>
       <small className="logo">
         <FaShopify className='logo'/>
         cartly
       </small>
       <SearchItems/>
       <div className="header-btn-container">
         {carts.length !== 0 && <small className="item-number">
           {carts.length}
         </small>}
       {isAdmin && <GrAdd onClick={showForm} className='add-btn icon'/>}
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
       <BsFillCartCheckFill className='head-cart icon' onClick={toggleCartDisplay}/>
       </div>
   </header>
  )
}

export default Header
