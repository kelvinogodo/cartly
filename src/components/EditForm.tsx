import {useState} from 'react'
import {FaShopify} from 'react-icons/fa'
import {AiOutlineClose} from 'react-icons/ai'
import { useGlobalContext } from '../Context'
import {motion,AnimatePresence} from 'framer-motion'
const EditForm = () => {
    const {items,closeEditForm,editId,updateData} = useGlobalContext()
    const [name,setName]=useState<string>('')
    const [prize,setPrize]=useState<number | string>('')
    const [id,setId]=useState<string>('')
    const [size,setSize] =useState<string>('')
    const [category,setCategory] =useState<string>('')
    const [color,setColor] =useState<string>('')
    const [image,setImage] = useState<string>('')
    const [madeIn,setMadeIn] =useState<string>('')
    const editData = (e: React.FormEvent) =>{
        e.preventDefault()
        updateData({id:id,name:name,prize:prize,size:size,color:color,category:category,image:image,madeIn:madeIn})
        setName('')
        setPrize ('')
        setId('')
        setImage('')
        setColor('')
        setCategory('')
        setSize('')
        closeEditForm()
    }
  return (
    <>
    {items.map((item: any) =>(item.id === editId &&
    <AnimatePresence key={item.id}>
    <motion.div animate={{opacity:1}} initial={{opacity:0}} exit={{opacity:0}} className="add-form-container">
    <AiOutlineClose className="close-btn" onClick={closeEditForm} />
    <form className='add-form' onSubmit={editData}>
        <div className='form-header'>
            <small className='logo'>
            cartly <FaShopify />
            </small>
        </div>
        <div className="addForm-body">
            <div className="right-body">
                <fieldset className="form-controller">
                    <legend>item name</legend>
                    <input type="text" value= {item.name} onChange={(e)=>setName(e.target.value)} required/>
                </fieldset>
                <fieldset className="form-controller">
                    <legend>item prize</legend>
                    <input type="text" value= {item.prize}  onChange={(e)=>{const prizeNum = parseInt(e.target.value); setPrize(prizeNum)}} required/>
                </fieldset>
                <fieldset className="form-controller">
                    <legend>item id</legend>
                    <input type="text" value={item.id}  onChange={(e)=>setId(e.target.value)} required />
                </fieldset>
                <fieldset className="form-controller">
                    <legend>size variations</legend>
                    <input type="text" value= {item.size} onChange={(e)=>setSize(e.target.value)} required/>
                </fieldset>
                </div>
            <div className="left-body">
                <fieldset className="form-controller">
                    <legend>colors available</legend>
                    <input type="text" value= {item.color}  onChange={(e)=>{setColor(e.target.value)}} required/>
                </fieldset>
                <fieldset className="form-controller">
                    <legend>made in</legend>
                    <input type="text" value={item.madeIn}  onChange={(e)=>setMadeIn(e.target.value)} required />
                </fieldset>
                <fieldset className="form-controller">
                    <legend>category</legend>
                    <input type="text" value={item.category}  onChange={(e)=>setCategory(e.target.value)} required />
                </fieldset>
                <fieldset className="form-controller">
                    <legend>upload item image</legend>
                    <input type="text" value={item.image}  onChange={(e)=>setImage(e.target.value)} required />
                </fieldset>
                </div>
            </div>
            <input type="submit" value="edit item" className='submit-btn'/>
    </form>
    </motion.div>
    </AnimatePresence>
    ))}
    </>
  )
}

export default EditForm
