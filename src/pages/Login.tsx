import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
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
      <div className="auth-visual" />
      <div className="auth-panel">
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-heading">
            <div className="logo">Cartly</div>
            <p>Welcome back</p>
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="field-error" style={{ marginTop: -8, marginBottom: 16 }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="auth-switch">No account? <Link to="/signup">Create one</Link></div>
        </form>
      </div>
    </div>
  )
}

export default Login
