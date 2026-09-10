import { Link, useParams } from 'react-router-dom'
import { AiTwotoneHeart } from 'react-icons/ai'
import { MdOutlineAdd } from 'react-icons/md'
import { BsFillArrowLeftCircleFill } from 'react-icons/bs'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useProduct } from '../hooks/useProduct'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { getProductImageUrl } from '../lib/images'

const ProductDetail = () => {
  const { slug } = useParams()
  const { data: product, isLoading, error } = useProduct(slug)
  const { likedIds, toggle } = useWishlist()
  const { addItem } = useCart()
  const { user } = useAuth()

  return (
    <div>
      <Header />
      <section className='more-info-card' style={{position: 'relative'}}>
        {isLoading && <p>loading...</p>}
        {error && <p>product not found.</p>}
        {product && (
          <>
            <Link to='/'><BsFillArrowLeftCircleFill className='more-info-close-btn close-btn' /></Link>
            <div className='item more-info-item'>
              <AiTwotoneHeart
                className={likedIds.has(product.id) ? 'liked' : 'unliked'}
                onClick={() => user && toggle(product.id)}
              />
              <img src={getProductImageUrl(product.image_path)} alt={product.name} />
              <div className="item-info">
                <p>{product.name}</p>
                <small className='prize'> {`price: $${product.price}`}</small>
              </div>
            </div>
            <div className='item more-info-item second'>
              <div className="item-info">
                <p>available colors: <small><b>{product.color}</b></small></p>
                <p>size: <small><b>{product.size}</b></small></p>
                <p>made in: <small><b>{product.made_in}</b></small></p>
              </div>
              <MdOutlineAdd className='add-item-btn' onClick={() => addItem(product.id)} />
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default ProductDetail
