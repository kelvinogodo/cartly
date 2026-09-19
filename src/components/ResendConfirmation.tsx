import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const COOLDOWN_SECONDS = 60

/** "Resend confirmation email" with a cooldown so it can't be hammered. */
export const ResendConfirmation = ({ email }: { email: string }) => {
  const { resendConfirmation } = useAuth()
  const [cooldown, setCooldown] = useState(0)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [cooldown])

  const onClick = async () => {
    setError(null)
    setCooldown(COOLDOWN_SECONDS)
    const { error } = await resendConfirmation(email)
    if (error) {
      setError(error)
      setCooldown(0)
      return
    }
    setSent(true)
  }

  return (
    <div className="resend" aria-live="polite">
      <button type="button" className="link-btn" onClick={onClick} disabled={cooldown > 0 || !email}>
        {cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend confirmation email'}
      </button>
      {sent && !error && <p className="resend-note">Sent — check your inbox and spam folder.</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
