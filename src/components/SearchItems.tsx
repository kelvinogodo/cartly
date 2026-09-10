import { useUIContext } from '../context/UIContext'
const SearchItems = () => {
  const {setSearchTerm} = useUIContext()
  return (
    <form className='search-input-container'>
        <input type="search" name="" id="" placeholder='enter name of item to search' className='search-input' onChange={(e)=>{
          e.preventDefault()
          setSearchTerm(e.target.value)}}/>
    </form>
  )
}

export default SearchItems
