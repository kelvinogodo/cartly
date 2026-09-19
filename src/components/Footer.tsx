import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSubscribeNewsletter } from '../hooks/useSubscribeNewsletter'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../context/AuthContext'
import { useUIContext } from '../context/UIContext'
import { useScrollToSection } from '../hooks/useScrollToSection'
import { LEGAL_DOCS } from '../content/legal'
import { friendlyFormError } from '../lib/errors'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const subscribe = useSubscribeNewsletter()
  const { data: categories } = useCategories()
  const { user } = useAuth()
  const { setCategoryFilter } = useUIContext()
  const scrollToSection = useScrollToSection()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    subscribe.mutate({ email, honeypot }, { onSuccess: () => setEmail('') })
  }

  const alreadySubscribed = subscribe.isError && subscribe.error?.code === '23505'

  const goToCategory = (categoryId: string) => {
    setCategoryFilter(categoryId)
    scrollToSection('collection')
  }

  const goToContact = () => {
    scrollToSection('contact')
  }

  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-col">
          <div className="footer-col-title">Shop</div>
          {categories?.map((category) => (
            <button key={category.id} onClick={() => goToCategory(category.id)}>{category.name}</button>
          ))}
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Account</div>
          {user ? <Link to="/account">My orders</Link> : <Link to="/login">Sign in</Link>}
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Bag</Link>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Help</div>
          <button onClick={goToContact}>Contact us</button>
          {LEGAL_DOCS.map((d) => <Link key={d.slug} to={`/${d.slug}`}>{d.title}</Link>)}
        </div>
      </div>

      <div className="footer-newsletter">
        <div className="serif" style={{ fontSize: 18, color: '#F7F5F1' }}>New arrivals, in your inbox</div>
        <div className="footer-note">Occasional notes on new pieces. No noise.</div>
        <form onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="hp-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <button type="submit" disabled={subscribe.isPending}>{subscribe.isPending ? '…' : 'Join →'}</button>
        </form>
        {subscribe.isSuccess && <small className="footer-note">You're on the list — thank you.</small>}
        {alreadySubscribed && <small className="footer-note">That email is already subscribed.</small>}
        {subscribe.isError && !alreadySubscribed && <small className="footer-note">{friendlyFormError(subscribe.error, "Couldn't subscribe — please try again.")}</small>}
      </div>
    </footer>
  )
}

export default Footer
