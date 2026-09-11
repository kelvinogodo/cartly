import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
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

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-panel">
          <div className="auth-form">
            <div className="auth-heading"><div className="logo">Cartly</div></div>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
              Check your email to confirm your account, then <Link to="/login">sign in</Link>.
            </p>
          </div>
        </div>
        <div className="auth-visual" />
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-heading">
            <div className="logo">Cartly</div>
            <p>Create your account</p>
          </div>

          <div className="field">
            <label>Full name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && <p className="field-error" style={{ marginTop: -8, marginBottom: 16 }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div>
        </form>
      </div>
      <div className="auth-visual" />
    </div>
  )
}

export default Signup
