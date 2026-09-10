import { Link } from 'react-router-dom'
import { AiOutlineClose } from 'react-icons/ai'
import { FaShopify } from 'react-icons/fa'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../hooks/useCart'
import { computeCartTotal } from '../lib/cart'
import { getProductImageUrl } from '../lib/images'

const CartPage = () => {
  const { items, removeItem } = useCart()
  const total = computeCartTotal(items)

  return (
    <div>
      <Header />
      <section className='cart-page'>
        <div className='cart-page-list'>
          <div className='form-header'>
            <small className='logo'>
              cartly <FaShopify />
            </small>
          </div>
          <small className='prize-badge'>total = {`$${total}`}</small>
          {items.length === 0 ? (
            <p>your cart is empty. <Link to='/'>keep shopping</Link></p>
          ) : (
            items.map((cartItem) => (
              <div className='cart-slide' key={cartItem.productId}>
                <AiOutlineClose className="delete-item-btn" onClick={() => removeItem(cartItem.productId)} />
                <img src={getProductImageUrl(cartItem.product.image_path)} alt={cartItem.product.name} className='item-pic' />
                <div className="item-info">
                  <p>{cartItem.product.name}</p>
                  <p>available colors: <small><b>{cartItem.product.color}</b></small></p>
                  <p>size: <small><b>{cartItem.product.size}</b></small></p>
                  <p>made in: <small><b>{cartItem.product.made_in}</b></small></p>
                  <p>quantity: <small><b>{cartItem.quantity}</b></small></p>
                  <p>price: <small><b>${cartItem.product.price}</b></small></p>
                </div>
              </div>
            ))
          )}
          <button className='check-out-btn' type='submit' disabled={items.length === 0}>check out</button>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default CartPage
