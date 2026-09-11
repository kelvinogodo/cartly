import { Link } from 'react-router-dom'
import { FaShopify } from 'react-icons/fa'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useProducts } from '../../hooks/useProducts'
import { useDeleteProduct } from '../../hooks/useProductMutations'
import { getProductImageUrl } from '../../lib/images'

const AdminProductList = () => {
  const { data: products, isLoading, error } = useProducts()
  const deleteProduct = useDeleteProduct()

  const onDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This can't be undone.`)) {
      deleteProduct.mutate(id)
    }
  }

  return (
    <div>
      <Header />
      <section className='cart-page'>
        <div className='cart-page-list' style={{ maxWidth: 900 }}>
          <div className='form-header'>
            <small className='logo'>
              cartly <FaShopify />
            </small>
          </div>
          <h5>manage products</h5>
          <Link to='/admin/products/new' className='submit-btn' style={{ textDecoration: 'none', textAlign: 'center', width: '80%' }}>
            + add product
          </Link>
          {isLoading && <p>loading...</p>}
          {error && <p>could not load products.</p>}
          {products?.map((product) => (
            <div key={product.id} className='cart-slide'>
              <img src={getProductImageUrl(product.image_path)} alt={product.name} className='item-pic' />
              <div className="item-info">
                <p>{product.name}</p>
                <small>${product.price} · stock {product.stock}{product.is_featured ? ' · featured' : ''}</small>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <Link to={`/admin/products/${product.id}/edit`}>edit</Link>
                <button type='button' onClick={() => onDelete(product.id, product.name)}>delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default AdminProductList
