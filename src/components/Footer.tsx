import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiTwitter, FiMail } from 'react-icons/fi'
import { useSubscribeNewsletter } from '../hooks/useSubscribeNewsletter'
import { useCategories } from '../hooks/useCategories'
import { useUIContext } from '../context/UIContext'

const Footer = () => {
  const [email, setEmail] = useState('')
  const subscribe = useSubscribeNewsletter()
  const { data: categories } = useCategories()
  const { setCategoryFilter } = useUIContext()
  const navigate = useNavigate()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    subscribe.mutate(email, { onSuccess: () => setEmail('') })
  }

  const alreadySubscribed = subscribe.isError && subscribe.error?.code === '23505'

  const goToCategory = (categoryId: string) => {
    setCategoryFilter(categoryId)
    navigate('/')
  }

  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-col">
          <div className="footer-col-title">Shop</div>
          {categories?.map((category) => (
            <button key={category.id} onClick={() => goToCategory(category.id)} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', font: 'inherit', color: 'inherit' }}>
              {category.name}
            </button>
          ))}
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Cartly</div>
          <div>Our story</div>
          <div>Returns</div>
          <div className="footer-social" style={{ marginTop: 8 }}>
            <a href="#" aria-label="Instagram"><FiInstagram size={16} /></a>
            <a href="#" aria-label="Facebook"><FiFacebook size={16} /></a>
            <a href="#" aria-label="Twitter"><FiTwitter size={16} /></a>
          </div>
        </div>
      </div>

      <div className="footer-newsletter">
        <div className="serif" style={{ fontSize: 16, color: '#F7F5F1' }}>The Autumn Journal</div>
        <div className="footer-note">A note to your inbox, now and then — new arrivals, not noise.</div>
        <form onSubmit={onSubmit}>
          <FiMail size={16} style={{ flexShrink: 0, alignSelf: 'center' }} />
          <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={subscribe.isPending}>{subscribe.isPending ? '...' : 'Join →'}</button>
        </form>
        {subscribe.isSuccess && <small className="footer-note">Subscribed!</small>}
        {alreadySubscribed && <small className="footer-note">Already subscribed.</small>}
        {subscribe.isError && !alreadySubscribed && <small className="footer-note">Couldn't subscribe, try again.</small>}
      </div>
    </footer>
  )
}

export default Footer
