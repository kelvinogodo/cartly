import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const NotFound = () => {
  useDocumentTitle('Page not found')
  return (
    <div>
      <main className="notfound">
        <div className="notfound-code">404</div>
        <h1>We can't find that page</h1>
        <p>The link may be out of date, or the piece you're looking for has sold out and been removed.</p>
        <Link to="/" className="btn-primary">Back to the store</Link>
      </main>
    </div>
  )
}

export default NotFound
