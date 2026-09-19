import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/**
 * Shared chrome for store pages. Header/footer stay mounted across
 * navigation; only the page body cross-fades. `useOutlet()` (rather than
 * <Outlet/>) is used so the outgoing page keeps rendering its own route while
 * it animates out.
 */
export function SiteLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <>
      <Header />
      <AnimatePresence exitBeforeEnter initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 0.8, 0.24, 1] }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  )
}
