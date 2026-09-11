import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaShopify } from 'react-icons/fa'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../hooks/useCart'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { computeCartTotal } from '../lib/cart'

const Checkout = () => {
  const { items } = useCart()
  const total = computeCartTotal(items)
  const createOrder = useCreateOrder()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createOrder.mutateAsync({ name, address, phone })
      navigate('/account')
    } catch {
      // error surfaced below via createOrder.isError
    }
  }

  return (
    <div>
      <Header />
      <section className='cart-page'>
        {items.length === 0 ? (
          <p>your cart is empty. <Link to='/'>keep shopping</Link></p>
        ) : (
          <form className='cart-page-list' onSubmit={onSubmit}>
            <div className='form-header'>
              <small className='logo'>
                cartly <FaShopify />
              </small>
            </div>
            <small className='prize-badge'>total = {`$${total}`}</small>
            <fieldset className="form-controller">
              <legend>full name</legend>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </fieldset>
            <fieldset className="form-controller">
              <legend>shipping address</legend>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </fieldset>
            <fieldset className="form-controller">
              <legend>phone number</legend>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </fieldset>
            {createOrder.isError && (
              <small className="prize" style={{ color: 'crimson' }}>
                {(createOrder.error as Error).message}
              </small>
            )}
            <input
              type="submit"
              value={createOrder.isPending ? 'placing order...' : 'place order'}
              className='submit-btn'
              disabled={createOrder.isPending}
            />
          </form>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default Checkout
