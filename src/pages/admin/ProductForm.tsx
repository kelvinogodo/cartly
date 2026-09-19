import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FiStar, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { useCategories } from '../../hooks/useCategories'
import { useProductImages } from '../../hooks/useProductImages'
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProductMutations'
import { removeStoredImages, uploadProductImage } from '../../lib/storage'
import { getProductImageUrl } from '../../lib/images'
import { formatOptionList, parseOptionList } from '../../lib/options'
import { slugify } from '../../lib/slug'
import { supabase } from '../../lib/supabaseClient'
import type { Product } from '../../types/domain'

// One photo in the form: an already-stored path, or a file waiting to be uploaded.
interface FormImage {
  id: string
  path: string // stored path/URL, or an object URL for a pending file
  file?: File
}

const ProductForm = ({ product }: { product?: Product }) => {
  const isEditing = !!product
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories } = useCategories()
  const { data: storedExtras } = useProductImages(product?.id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '0')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [sizes, setSizes] = useState(formatOptionList(product?.sizes ?? []))
  const [colors, setColors] = useState(formatOptionList(product?.colors ?? []))
  const [madeIn, setMadeIn] = useState(product?.made_in ?? '')
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const [images, setImages] = useState<FormImage[]>(
    product?.image_path ? [{ id: 'cover', path: product.image_path }] : []
  )
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // The gallery rows load after the product; fold them in once, without clobbering edits.
  const hydrated = useRef(false)
  useEffect(() => {
    if (!product || !storedExtras || hydrated.current) return
    hydrated.current = true
    setImages([
      { id: 'cover', path: product.image_path },
      ...storedExtras.map((row) => ({ id: row.id, path: row.image_path })),
    ])
  }, [product, storedExtras])

  const isSaving = createProduct.isPending || updateProduct.isPending || saving

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // allow picking the same file again
    setImages((current) => [
      ...current,
      ...files.map((file) => ({ id: crypto.randomUUID(), path: URL.createObjectURL(file), file })),
    ])
  }

  const makeCover = (id: string) =>
    setImages((current) => {
      const picked = current.find((img) => img.id === id)
      return picked ? [picked, ...current.filter((img) => img.id !== id)] : current
    })

  const removeImage = (id: string) => setImages((current) => current.filter((img) => img.id !== id))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (images.length === 0) {
      setFormError('Please add at least one product photo.')
      return
    }
    setSaving(true)
    try {
      // Upload anything new; the first photo is the cover, the rest form the gallery.
      const finalPaths: string[] = []
      for (const img of images) {
        finalPaths.push(img.file ? await uploadProductImage(img.file) : img.path)
      }
      const [cover, ...extras] = finalPaths as [string, ...string[]]

      const payload = {
        name,
        slug: slugify(name),
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category_id: categoryId || null,
        image_path: cover,
        sizes: parseOptionList(sizes),
        colors: parseOptionList(colors),
        made_in: madeIn || null,
        is_featured: isFeatured,
      }

      const saved = isEditing
        ? await updateProduct.mutateAsync({ id: product.id, updates: payload })
        : await createProduct.mutateAsync(payload)

      // Replace the gallery rows with the current set.
      const { error: clearError } = await supabase.from('product_images').delete().eq('product_id', saved.id)
      if (clearError) throw clearError
      if (extras.length > 0) {
        const { error: insertError } = await supabase
          .from('product_images')
          .insert(extras.map((path, i) => ({ product_id: saved.id, image_path: path, sort_order: i + 1 })))
        if (insertError) throw insertError
      }
      await queryClient.invalidateQueries({ queryKey: ['product'] })

      // Uploads that are no longer referenced are now orphaned in Storage.
      if (isEditing) {
        const before = [product.image_path, ...(storedExtras ?? []).map((row) => row.image_path)]
        await removeStoredImages(before.filter((path) => !finalPaths.includes(path)))
      }
      navigate('/admin/products')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-form-wrap">
      <h1 className="serif" style={{ fontSize: 24 }}>{isEditing ? 'Edit product' : 'Add product'}</h1>
      <form onSubmit={onSubmit}>
        <div className="admin-form-cols">
          <div>
            <div className="field">
              <label htmlFor="pf-name">Item name</label>
              <input id="pf-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pf-price">Price</label>
              <input id="pf-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pf-stock">Stock</label>
              <input id="pf-stock" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pf-category">Category</label>
              <select id="pf-category" value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value)}>
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
              <label htmlFor="pf-sizes">Sizes offered</label>
              <input id="pf-sizes" type="text" placeholder="S, M, L, XL — leave blank if one size" value={sizes} onChange={(e) => setSizes(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pf-colors">Colours offered</label>
              <input id="pf-colors" type="text" placeholder="Navy, Black — leave blank if not applicable" value={colors} onChange={(e) => setColors(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pf-madein">Made in</label>
              <input id="pf-madein" type="text" value={madeIn ?? ''} onChange={(e) => setMadeIn(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pf-description">Description</label>
              <textarea id="pf-description" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label>Photos</label>
              <label className="dropzone" style={{ cursor: 'pointer' }}>
                <FiUploadCloud size={24} />
                <span>Click to add photos</span>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onPickFiles} aria-label="Add photos" />
              </label>
            </div>
            {images.length > 0 && (
              <ul className="photo-list" aria-label="Product photos">
                {images.map((img, i) => (
                  <li key={img.id} className="photo-item">
                    <img src={img.file ? img.path : getProductImageUrl(img.path)} alt={i === 0 ? 'Cover photo' : `Photo ${i + 1}`} />
                    {i === 0 && <span className="photo-cover">Cover</span>}
                    <div className="photo-actions">
                      {i !== 0 && (
                        <button type="button" onClick={() => makeCover(img.id)} aria-label={`Make photo ${i + 1} the cover`}><FiStar size={13} /></button>
                      )}
                      <button type="button" onClick={() => removeImage(img.id)} aria-label={`Remove photo ${i + 1}`}><FiTrash2 size={13} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {formError && <p className="field-error" role="alert" style={{ marginBottom: 16 }}>{formError}</p>}

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
