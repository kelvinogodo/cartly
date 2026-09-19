import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { CartDrawerProvider } from './context/CartDrawerContext'
import LegalPage from './pages/LegalPage'
import { LEGAL_DOCS } from './content/legal'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { UIProvider } from './context/UIContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { SiteLayout } from './components/SiteLayout'

// Admin pages are only ever needed by admins — code-split so anonymous/
// customer traffic (the vast majority) doesn't pay for this in the initial bundle.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProductList = lazy(() => import('./pages/admin/AdminProductList'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminErrors = lazy(() => import('./pages/admin/AdminErrors'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminProductNew = lazy(() => import('./pages/admin/AdminProductNew'))
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <CartDrawerProvider>
                <UIProvider>
                  <MotionConfig reducedMotion="user">
                    <ScrollToTop />
                    <Suspense fallback={null}>
                      <Routes>
                        <Route element={<SiteLayout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/products/:slug" element={<ProductDetail />} />
                          {LEGAL_DOCS.map((doc) => <Route key={doc.slug} path={`/${doc.slug}`} element={<LegalPage doc={doc} />} />)}
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                          <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminProductList /></ProtectedRoute>} />
                          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />
                          <Route path="/admin/errors" element={<ProtectedRoute role="admin"><AdminErrors /></ProtectedRoute>} />
                          <Route path="/admin/categories" element={<ProtectedRoute role="admin"><AdminCategories /></ProtectedRoute>} />
                          <Route path="/admin/products/new" element={<ProtectedRoute role="admin"><AdminProductNew /></ProtectedRoute>} />
                          <Route path="/admin/products/:id/edit" element={<ProtectedRoute role="admin"><AdminProductEdit /></ProtectedRoute>} />
                          <Route path="*" element={<NotFound />} />
                        </Route>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                      </Routes>
                    </Suspense>
                  </MotionConfig>
                </UIProvider>
                </CartDrawerProvider>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
