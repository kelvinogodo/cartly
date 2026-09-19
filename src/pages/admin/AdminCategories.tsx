import { useState, type FormEvent } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '../../hooks/useCategoryMutations'
import { useToast } from '../../context/ToastContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { slugify } from '../../lib/slug'
import type { Category } from '../../types/domain'
import AdminShell from './AdminShell'

const Row = ({ category }: { category: Category }) => {
  const update = useUpdateCategory()
  const remove = useDeleteCategory()
  const toast = useToast()
  const [name, setName] = useState(category.name)
  const [order, setOrder] = useState(String(category.sort_order))
  const dirty = name.trim() !== category.name || Number(order) !== category.sort_order

  const save = () =>
    update.mutate(
      { id: category.id, updates: { name: name.trim(), slug: slugify(name), sort_order: Number(order) || 0 } },
      {
        onSuccess: () => toast.show({ title: 'Category saved' }),
        onError: (e) => toast.show({ title: 'Could not save', description: e.message, tone: 'error' }),
      },
    )

  const onDelete = () => {
    if (!window.confirm(`Delete "${category.name}"? Its products are kept but become uncategorised.`)) return
    remove.mutate(category.id, {
      onSuccess: () => toast.show({ title: 'Category deleted' }),
      onError: (e) => toast.show({ title: 'Could not delete', description: e.message, tone: 'error' }),
    })
  }

  return (
    <div className="admin-row">
      <input className="admin-inline" aria-label={`Name of ${category.name}`} value={name} onChange={(e) => setName(e.target.value)} />
      <input className="admin-inline" style={{ width: 80, flex: '0 0 80px' }} type="number" aria-label={`Order of ${category.name}`} value={order} onChange={(e) => setOrder(e.target.value)} />
      <div className="admin-row-actions">
        <button onClick={save} disabled={!dirty || !name.trim() || update.isPending}>Save</button>
        <button className="danger" onClick={onDelete} disabled={remove.isPending}>Delete</button>
      </div>
    </div>
  )
}

const AdminCategories = () => {
  useDocumentTitle('Admin · Categories')
  const { data: categories, isLoading } = useCategories()
  const create = useCreateCategory()
  const toast = useToast()
  const [name, setName] = useState('')

  const onAdd = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    create.mutate(
      { name: trimmed, slug: slugify(trimmed), sort_order: (categories?.length ?? 0) + 1 },
      {
        onSuccess: () => { setName(''); toast.show({ title: 'Category added' }) },
        onError: (err) => toast.show({ title: 'Could not add', description: err.message, tone: 'error' }),
      },
    )
  }

  return (
    <AdminShell>
      <section className="admin-page">
        <div className="admin-toprow"><h1 className="serif" style={{ fontSize: 26 }}>Categories</h1></div>

        <form className="admin-add" onSubmit={onAdd}>
          <input className="admin-inline" placeholder="New category name" aria-label="New category name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary" type="submit" disabled={!name.trim() || create.isPending}>+ Add category</button>
        </form>

        <div className="admin-table-head">
          <div style={{ flex: 1 }}>Name</div>
          <div style={{ width: 80 }}>Order</div>
          <div style={{ width: 100 }} />
        </div>
        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {categories?.map((c) => <Row key={c.id} category={c} />)}
      </section>
    </AdminShell>
  )
}

export default AdminCategories
