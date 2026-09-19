import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { hasPendingScroll } from '../lib/scroll'

/** Resets scroll on navigation (unless something queued a scroll to a specific section). */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (hasPendingScroll()) return
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
