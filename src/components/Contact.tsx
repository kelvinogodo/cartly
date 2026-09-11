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
            <div className="advert-text">
                <h3>We make you look magnificent</h3>
                <p>Considered pieces, honest fabrics, and a fit that holds up past the first wash — that's the whole idea.</p>
            </div>
            <img src="/images/designer-mens-suits-500x500-removebg-preview.png" alt="" className="advert-img" />
        </div>
        <div className="form-section">
            <h3>Get in touch</h3>
            <form onSubmit={onSubmit}>
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div className="field">
                  <label>Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
                </div>
                {submitInquiry.isSuccess && <small style={{color:'var(--accent)'}}>Thanks — we'll be in touch.</small>}
                {submitInquiry.isError && <small className="field-error">Couldn't send that, try again.</small>}
                <button type="submit" className="btn-primary" style={{width:'100%', marginTop: 8}} disabled={submitInquiry.isPending}>
                  {submitInquiry.isPending ? 'Sending…' : 'Send'}
                </button>
            </form>
        </div>
    </section>
  )
}

export default Contact
