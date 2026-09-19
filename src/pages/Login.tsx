import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ResendConfirmation } from '../components/ResendConfirmation'

const Login = () => {
  useDocumentTitle('Sign in')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo ?? '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src="/images/editorial/auth.jpg" alt="" />
        <div className="auth-visual-quote">Dress for the day you want to have.</div>
      </div>
      <div className="auth-panel">
        <Link to="/" className="auth-back"><FiArrowLeft size={14} /> Back to store</Link>
        <div className="auth-center">
          <motion.form
            className="auth-form"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}
          >
            <div className="auth-heading">
              <Link to="/" className="logo" aria-label="Cartly — home">Cartly</Link>
              <h1>Welcome back</h1>
              <p>Sign in to see your orders and saved pieces.</p>
            </div>

            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="login-password" className="field-label-row">Password <Link to="/forgot-password" className="field-link">Forgot password?</Link></label>
              <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && <p className="field-error" role="alert" style={{ marginTop: -6, marginBottom: 14 }}>{error}</p>}
            {error && /not confirmed/i.test(error) && <ResendConfirmation email={email} />}

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="auth-switch">New to Cartly? <Link to="/signup">Create an account</Link></div>
          </motion.form>
        </div>
      </div>
    </div>
  )
}

export default Login
