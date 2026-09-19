import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/**
 * Landing page for the emailed recovery link. Supabase exchanges the link's
 * token for a session on load, so an active session here means the link was valid.
 */
const ResetPassword = () => {
  useDocumentTitle('Choose a new password')
  const { session, loading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    toast.show({ title: 'Password updated', description: 'You are signed in with your new password.' })
    navigate('/', { replace: true })
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
          {loading ? (
            <p className="empty-state">Verifying your link…</p>
          ) : !session ? (
            <div className="auth-form" style={{ textAlign: 'center', alignItems: 'center' }}>
              <div className="auth-heading" style={{ marginBottom: 20 }}>
                <h1>This link has expired</h1>
                <p>Reset links can only be used once and expire after a short while. Request a fresh one.</p>
              </div>
              <Link to="/forgot-password" className="btn-primary" style={{ width: '100%' }}>Request a new link</Link>
            </div>
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
                <h1>Choose a new password</h1>
                <p>At least 6 characters.</p>
              </div>
              <div className="field">
                <label htmlFor="rp-password">New password</label>
                <input id="rp-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="field">
                <label htmlFor="rp-confirm">Confirm password</label>
                <input id="rp-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
              </div>
              {error && <p className="field-error" role="alert" style={{ marginTop: -6, marginBottom: 14 }}>{error}</p>}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Update password'}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
