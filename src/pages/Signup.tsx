import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FaShopify } from 'react-icons/fa'
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
      <main className='signup-form-container'>
        <div className="add-form">
          <div className='form-header'>
            <small className='logo'>
              cartly <FaShopify />
            </small>
          </div>
          <p>Check your email to confirm your account, then <Link to="/login">sign in</Link>.</p>
        </div>
      </main>
    )
  }

  return (
    <main className='signup-form-container'>
      <form className="sign-up-form add-form" onSubmit={onSubmit}>
        <div className='form-header'>
          <small className='logo'>
            cartly <FaShopify />
          </small>
        </div>
        <fieldset className="form-controller">
          <legend>full name</legend>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </fieldset>
        <fieldset className="form-controller">
          <legend>email</legend>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </fieldset>
        <fieldset className="form-controller">
          <legend>password</legend>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </fieldset>
        {error && <small className="prize" style={{ color: 'crimson' }}>{error}</small>}
        <input type="submit" value={submitting ? 'signing up...' : 'sign up'} className='submit-btn' disabled={submitting} />
        <p>
          already have an account? <Link to="/login">sign in</Link>
        </p>
      </form>
    </main>
  )
}

export default Signup
