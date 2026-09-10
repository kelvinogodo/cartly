import './App.css'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { ProtectedRoute } from './components/ProtectedRoute'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <UIProvider>
    <BrowserRouter>
    <div className="app">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products/:slug' element={<ProductDetail />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/admin' element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
        </Routes>
    </div>
    </BrowserRouter>
    </UIProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
