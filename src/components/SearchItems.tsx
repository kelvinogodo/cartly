import { useUIContext } from '../context/UIContext'
const SearchItems = () => {
  const {setSearchTerm} = useUIContext()
  return (
    <form className='search-input-container' onSubmit={(e) => e.preventDefault()}>
        <input type="search" placeholder='Search products' className='search-input' autoFocus onChange={(e)=>{
          setSearchTerm(e.target.value)}}/>
    </form>
  )
}

export default SearchItems
