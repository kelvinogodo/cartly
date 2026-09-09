import React, {useState} from 'react'
import {AiOutlineClose} from 'react-icons/ai'
import {FaShopify} from 'react-icons/fa'
import { useContext } from 'react'
import GlobalContext from '../Context'
import {motion,AnimatePresence} from 'framer-motion'
const AddForm = () => {
    const {addItem,closeForm} =useContext(GlobalContext)
    const [name,setName]=useState()
    const [prize,setPrize]=useState()
    const [id,setid]=useState()
    const [size,setSize] =useState()
    const [category,setCategory] =useState()
    const [color,setColor] =useState()
    const [image,setImage] = useState()
    const [madeIn,setMadeIn] =useState() 

    const onSubmit=(e)=>{
        e.preventDefault()
        addItem({name,prize,id,size,image,madeIn,category,color})
        setName('')
        setPrize ('')
        setid('') 
        setImage('')  
        setColor('')
        setCategory('')
        setSize('')
        closeForm()
    }
  return (
    <AnimatePresence>
    <motion.div animate={{opacity:1}} initial={{opacity:0}} exit={{opacity:0}} className="add-form-container">
        <AiOutlineClose className="close-btn" onClick={closeForm}/>
         <motion.form animate={{marginTop:0}} initial={{marginTop:'-2000px'}} className='add-form' onSubmit={onSubmit}>
             <div className='form-header'>
                 <small className='logo'>
                    cartly <FaShopify />
                 </small>
             </div>
        <div className="addForm-body">
            <div className="right-body">
                <fieldset className="form-controller">
                    <legend>item name</legend>
                    <input type="text"  value= {name} onChange={(e)=>setName(e.target.value)} required/>
                </fieldset>
                <fieldset className="form-controller">
                    <legend>item prize</legend>
                    <input type="text"  value  = {prize}  onChange={(e)=>{const prizeNum = parseInt(e.target.value); setPrize(prizeNum)}} required/>
                </fieldset>
                <fieldset className="form-controller">
                    <legend>item id</legend>
                    <input type="text"  value={id}  onChange={(e)=>setid(e.target.value)} required />
                </fieldset>
                <fieldset className="form-controller">
                    <legend>size variations</legend>
                    <input type="text"  value= {size} onChange={(e)=>setSize(e.target.value)} required/>
                </fieldset>
                </div>
            <div className="left-body">
                <fieldset className="form-controller">
                    <legend>colors available</legend>
                    <input type="text"  value  = {color}  onChange={(e)=>{setColor(e.target.value)}} required/>
                </fieldset>
                <fieldset className="form-controller">
                    <legend>made in</legend>
                    <input type="text"  value={madeIn}  onChange={(e)=>setMadeIn(e.target.value)} required />
                </fieldset>
                <fieldset className="form-controller">
                    <legend>category</legend>
                    <input type="text"  value={category}  onChange={(e)=>setCategory(e.target.value)} required />
                </fieldset>
                <fieldset className="form-controller">
                    <legend>upload item image</legend>
                    <input type="text"  value={image}  onChange={(e)=>setImage(e.target.value)} required />
                </fieldset>
                </div>
            </div>
            <input type="submit" value="Edit item" className='submit-btn'/>
        </motion.form>
    </motion.div> 
    </AnimatePresence>    
  )
}

export default AddForm