import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaShopify } from 'react-icons/fa'
import { useCategories } from '../../hooks/useCategories'
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProductMutations'
import { uploadProductImage } from '../../lib/storage'
import { getProductImageUrl } from '../../lib/images'
import { slugify } from '../../lib/slug'
import type { Product } from '../../types/domain'

const ProductForm = ({ product }: { product?: Product }) => {
  const isEditing = !!product
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '0')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [size, setSize] = useState(product?.size ?? '')
  const [color, setColor] = useState(product?.color ?? '')
  const [madeIn, setMadeIn] = useState(product?.made_in ?? '')
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const imagePath = product?.image_path ?? ''
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const isSaving = createProduct.isPending || updateProduct.isPending || uploading

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : (imagePath ? getProductImageUrl(imagePath) : '')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    try {
      let finalImagePath = imagePath
      if (imageFile) {
        setUploading(true)
        finalImagePath = await uploadProductImage(imageFile)
        setUploading(false)
      }
      if (!finalImagePath) {
        setFormError('Please choose a product image.')
        return
      }

      const payload = {
        name,
        slug: slugify(name),
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category_id: categoryId || null,
        image_path: finalImagePath,
        size: size || null,
        color: color || null,
        made_in: madeIn || null,
        is_featured: isFeatured,
      }

      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, updates: payload })
      } else {
        await createProduct.mutateAsync(payload)
      }
      navigate('/admin/products')
    } catch (err) {
      setUploading(false)
      setFormError(err instanceof Error ? err.message : 'Failed to save product.')
    }
  }

  return (
    <form className='add-form' onSubmit={onSubmit}>
      <div className='form-header'>
        <small className='logo'>
          cartly <FaShopify />
        </small>
      </div>
      <div className="addForm-body">
        <div className="right-body">
          <fieldset className="form-controller">
            <legend>item name</legend>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </fieldset>
          <fieldset className="form-controller">
            <legend>price</legend>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </fieldset>
          <fieldset className="form-controller">
            <legend>stock</legend>
            <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </fieldset>
          <fieldset className="form-controller">
            <legend>category</legend>
            <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value)} style={{ width: '90%', height: '100%' }}>
              <option value="">-- none --</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </fieldset>
          <fieldset className="form-controller">
            <legend>featured on home page</legend>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
              <input type="checkbox" style={{ width: 'auto', height: 'auto' }} checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              featured
            </label>
          </fieldset>
        </div>
        <div className="left-body">
          <fieldset className="form-controller">
            <legend>colors available</legend>
            <input type="text" value={color ?? ''} onChange={(e) => setColor(e.target.value)} />
          </fieldset>
          <fieldset className="form-controller">
            <legend>size variations</legend>
            <input type="text" value={size ?? ''} onChange={(e) => setSize(e.target.value)} />
          </fieldset>
          <fieldset className="form-controller">
            <legend>made in</legend>
            <input type="text" value={madeIn ?? ''} onChange={(e) => setMadeIn(e.target.value)} />
          </fieldset>
          <fieldset className="form-controller">
            <legend>description</legend>
            <input type="text" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
          </fieldset>
          <fieldset className="form-controller">
            <legend>product image</legend>
            <input type="file" accept="image/*" style={{ padding: '10px 20px' }} onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </fieldset>
          {previewUrl && <img src={previewUrl} alt="preview" style={{ maxHeight: 100, objectFit: 'contain', marginBottom: 20 }} />}
        </div>
      </div>
      {formError && <small className="prize" style={{ color: 'crimson' }}>{formError}</small>}
      <input
        type="submit"
        value={isSaving ? 'saving...' : isEditing ? 'save changes' : 'create product'}
        className='submit-btn'
        disabled={isSaving}
      />
    </form>
  )
}

export default ProductForm
