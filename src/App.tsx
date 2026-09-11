import './App.css'
import { lazy, Suspense } from 'react'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Admin pages are only ever needed by admins — code-split so anonymous/
// customer traffic (the vast majority) doesn't pay for this in the initial bundle.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProductList = lazy(() => import('./pages/admin/AdminProductList'))
const AdminProductNew = lazy(() => import('./pages/admin/AdminProductNew'))
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit'))

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <UIProvider>
    <BrowserRouter>
    <div className="app">
        <Suspense fallback={null}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products/:slug' element={<ProductDetail />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/admin' element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path='/admin/products' element={<ProtectedRoute role="admin"><AdminProductList /></ProtectedRoute>} />
          <Route path='/admin/products/new' element={<ProtectedRoute role="admin"><AdminProductNew /></ProtectedRoute>} />
          <Route path='/admin/products/:id/edit' element={<ProtectedRoute role="admin"><AdminProductEdit /></ProtectedRoute>} />
        </Routes>
        </Suspense>
    </div>
    </BrowserRouter>
    </UIProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
