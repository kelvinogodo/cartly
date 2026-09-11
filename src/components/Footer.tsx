import { useState, type FormEvent } from 'react'
import {BsWhatsapp} from 'react-icons/bs'
import {BsFacebook} from 'react-icons/bs'
import {BsInstagram} from 'react-icons/bs'
import {IoLogoTwitter} from 'react-icons/io'
import {SiGmail} from 'react-icons/si'
import { useSubscribeNewsletter } from '../hooks/useSubscribeNewsletter'

const Footer = () => {
  const [email, setEmail] = useState('')
  const subscribe = useSubscribeNewsletter()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    subscribe.mutate(email, { onSuccess: () => setEmail('') })
  }

  const alreadySubscribed = subscribe.isError && subscribe.error?.code === '23505'

  return (
    <footer>
        <div className="foot-container">
            <div className="foot">
                <ul>
                    <li>
                        <a href="" >
                            <BsWhatsapp className='footer-icon'/>
                        </a>
                        <a href="" >
                            <BsFacebook className='footer-icon'/>
                        </a>
                        <a href="" >
                            <BsInstagram className='footer-icon'/>
                        </a>
                        <a href="" >
                            <IoLogoTwitter className='footer-icon'/>
                        </a>
                        <a href="" >
                            <SiGmail className='footer-icon'/>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="foot">
                <form className="footer-input-container" onSubmit={onSubmit}>
                    <input type="email" className='footer-input' placeholder='sign up for our newsletter' value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    <button type="submit" className="gmail-container">
                        <SiGmail />
                    </button>
                </form>
                {subscribe.isSuccess && <small>subscribed!</small>}
                {alreadySubscribed && <small>already subscribed.</small>}
                {subscribe.isError && !alreadySubscribed && <small>couldn't subscribe, try again.</small>}
            </div>
        </div>
    </footer>
  )
}

export default Footer
