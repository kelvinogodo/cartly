import { useParams } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductForm from './ProductForm'
import { useProductById } from '../../hooks/useProductById'

const AdminProductEdit = () => {
  const { id } = useParams()
  const { data: product, isLoading, error } = useProductById(id)

  return (
    <div>
      <Header />
      <section className='cart-page'>
        {isLoading && <p>loading...</p>}
        {error && <p>product not found.</p>}
        {product && <ProductForm product={product} />}
      </section>
      <Footer />
    </div>
  )
}

export default AdminProductEdit
