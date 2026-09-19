import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiMail } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const Signup = () => {
  useDocumentTitle('Create account')
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signUp(email, password, fullName)
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
        <div className="auth-visual-quote">Fewer pieces, chosen with intent.</div>
      </div>
      <div className="auth-panel">
        <Link to="/" className="auth-back"><FiArrowLeft size={14} /> Back to store</Link>
        <div className="auth-center">
          {done ? (
            <motion.div className="auth-form" style={{ textAlign: 'center', alignItems: 'center' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <FiMail size={34} style={{ color: 'var(--accent)', marginBottom: 18 }} />
              <div className="auth-heading" style={{ marginBottom: 20 }}>
                <h1>Check your inbox</h1>
                <p>We sent a confirmation link to <strong>{email}</strong>. Confirm it, then sign in.</p>
              </div>
              <Link to="/login" className="btn-primary" style={{ width: '100%' }}>Go to sign in</Link>
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
                <h1>Create your account</h1>
                <p>Track orders and keep your wishlist on every device.</p>
              </div>

              <div className="field">
                <label htmlFor="su-name">Full name</label>
                <input id="su-name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="su-email">Email</label>
                <input id="su-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="su-password">Password</label>
                <input id="su-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>

              {error && <p className="field-error" role="alert" style={{ marginTop: -6, marginBottom: 14 }}>{error}</p>}

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </button>

              <div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Signup
