import { useState, type FormEvent } from 'react'
import { useSubmitInquiry } from '../hooks/useSubmitInquiry'

const Contact = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const submitInquiry = useSubmitInquiry()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submitInquiry.mutate(
      { email, message },
      { onSuccess: () => { setEmail(''); setMessage('') } }
    )
  }

  return (
    <section className='contact-section'>
        <div className="advert-section">
            <div className="advert-text-container">
                <h5>we make you look magnificent</h5>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odit temporibus obcaecati rem, reiciendis itaque repellendus. Asperiores doloribus earum dignissimos tempora?</p>
                <button className="visit-blog-btn">visit blog</button>
            </div>
            <img src="/images/designer-mens-suits-500x500-removebg-preview.png" alt="" className="advert-img" />
        </div>
        <div className="form-section">
            <img src="/images/preview (2).png" alt="" className="contact-img" />
            <form className="contact-form" onSubmit={onSubmit}>
                <h5 className="contact-form-header">
                    contact us
                    <span className="line"></span>
                </h5>
                <input type="email" className="contact-input" placeholder='enter your email' value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <textarea placeholder='type your message here' className="contact-text-area" value={message} onChange={(e) => setMessage(e.target.value)} required>
                </textarea>
                {submitInquiry.isSuccess && <small className="prize">thanks — we'll be in touch.</small>}
                {submitInquiry.isError && <small className="prize" style={{ color: 'crimson' }}>couldn't send that, try again.</small>}
                <input type="submit" value={submitInquiry.isPending ? 'sending...' : 'send'} className='contact-submit-btn' disabled={submitInquiry.isPending}/>
            </form>
        </div>
    </section>
  )
}

export default Contact
