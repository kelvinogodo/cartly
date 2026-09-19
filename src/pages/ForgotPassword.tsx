import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiMail } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const ForgotPassword = () => {
  useDocumentTitle('Reset password')
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await requestPasswordReset(email)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    setDone(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src="/images/editorial/auth.jpg" alt="" />
        <div className="auth-visual-quote">Dress for the day you want to have.</div>
      </div>
      <div className="auth-panel">
        <Link to="/login" className="auth-back"><FiArrowLeft size={14} /> Back to sign in</Link>
        <div className="auth-center">
          {done ? (
            <motion.div className="auth-form" style={{ textAlign: 'center', alignItems: 'center' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <FiMail size={34} style={{ color: 'var(--accent)', marginBottom: 18 }} />
              <div className="auth-heading" style={{ marginBottom: 20 }}>
                <h1>Check your inbox</h1>
                <p>If an account exists for <strong>{email}</strong>, a reset link is on its way. It can take a minute to arrive.</p>
              </div>
              <Link to="/login" className="btn-primary" style={{ width: '100%' }}>Back to sign in</Link>
            </motion.div>
          ) : (
            <motion.form
              className="auth-form"
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}
            >
              <div className="auth-heading">
                <Link to="/" className="logo" aria-label="Cartly — home">Cartly</Link>
                <h1>Forgot your password?</h1>
                <p>Enter your email and we'll send you a link to choose a new one.</p>
              </div>
              <div className="field">
                <label htmlFor="fp-email">Email</label>
                <input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {error && <p className="field-error" role="alert" style={{ marginTop: -6, marginBottom: 14 }}>{error}</p>}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
