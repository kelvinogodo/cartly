import { useState, type FormEvent } from 'react'
import { useSubmitInquiry } from '../hooks/useSubmitInquiry'
import { Reveal } from './ui/Reveal'
import { friendlyFormError } from '../lib/errors'

const Story = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const submitInquiry = useSubmitInquiry()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submitInquiry.mutate({ email, message, honeypot }, { onSuccess: () => { setEmail(''); setMessage('') } })
  }

  return (
    <section className="story" id="contact" aria-labelledby="contact-title">
      <div className="story-media">
        <img src="/images/editorial/story.jpg" alt="" loading="lazy" decoding="async" width={1600} height={1200} />
      </div>
      <Reveal className="story-form" y={16}>
        <div>
          <h2 id="contact-title">Questions about a fit or an order?</h2>
        </div>
        <p>Send us a note about sizing, styling, or an existing order.</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="contact-email">Email</label>
            <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="contact-website">Leave this field empty</label>
            <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={5000} />
          </div>
          {submitInquiry.isSuccess && <p style={{ fontSize: 13, marginBottom: 14 }}>Message sent — thank you.</p>}
          {submitInquiry.isError && <p className="field-error" style={{ color: '#ffb3bd', marginBottom: 14 }}>{friendlyFormError(submitInquiry.error, "Couldn't send that — please try again.")}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitInquiry.isPending}>
            {submitInquiry.isPending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </Reveal>
    </section>
  )
}

export default Story
