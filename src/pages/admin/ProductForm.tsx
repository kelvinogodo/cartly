import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUploadCloud } from 'react-icons/fi'
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
    <div className="admin-form-wrap">
      <h1 className="serif" style={{ fontSize: 24 }}>{isEditing ? 'Edit product' : 'Add product'}</h1>
      <form onSubmit={onSubmit}>
        <div className="admin-form-cols">
          <div>
            <div className="field">
              <label>Item name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Price</label>
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="field">
              <label>Stock</label>
              <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— none —</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="checkbox-row">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} id="featured" />
              <label htmlFor="featured" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>Featured on home page</label>
            </div>
          </div>

          <div>
            <div className="field">
              <label>Colors available</label>
              <input type="text" value={color ?? ''} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="field">
              <label>Size variations</label>
              <input type="text" value={size ?? ''} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div className="field">
              <label>Made in</label>
              <input type="text" value={madeIn ?? ''} onChange={(e) => setMadeIn(e.target.value)} />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label>Product image</label>
              <label className="dropzone" style={{ cursor: 'pointer' }}>
                <FiUploadCloud size={24} />
                <span>{imageFile ? imageFile.name : 'Click to choose an image'}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            {previewUrl && <img src={previewUrl} alt="preview" className="image-preview" />}
          </div>
        </div>

        {formError && <p className="field-error" style={{ marginBottom: 16 }}>{formError}</p>}

        <div className="admin-form-actions">
          <button type="button" className="btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
