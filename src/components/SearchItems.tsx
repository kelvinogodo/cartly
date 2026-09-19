import { useUIContext } from '../context/UIContext'
import { useScrollToSection } from '../hooks/useScrollToSection'

const SearchItems = ({ onDone }: { onDone?: () => void }) => {
  const { searchTerm, setSearchTerm } = useUIContext()
  const scrollToSection = useScrollToSection()

  const submit = () => {
    onDone?.()
    scrollToSection('collection')
  }

  return (
    <form
      className='search-input-container'
      role="search"
      onSubmit={(e) => { e.preventDefault(); submit() }}
    >
      <label className="visually-hidden" htmlFor="site-search">Search products</label>
      <input
        id="site-search"
        type="search"
        placeholder='Search suits, shoes, bags…'
        className='search-input'
        autoFocus
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  )
}

export default SearchItems
