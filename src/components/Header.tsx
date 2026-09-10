import {BsFillCartCheckFill} from 'react-icons/bs'
import {GrAdd} from 'react-icons/gr'
import {FaShopify} from 'react-icons/fa'
import SearchItems from './SearchItems'
import { useGlobalContext } from '../Context'
import {FaUserCircle} from 'react-icons/fa'
const Header = () => {
  const {carts,showForm,toggleCartDisplay} = useGlobalContext()
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
       <GrAdd onClick={showForm} className='add-btn icon'/>
       <FaUserCircle className='user-icon icon'/>
       <BsFillCartCheckFill className='head-cart icon' onClick={toggleCartDisplay}/>
       </div>
   </header>
  )
}

export default Header
