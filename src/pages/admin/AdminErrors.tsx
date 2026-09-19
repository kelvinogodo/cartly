import { useClearClientErrors, useClientErrors } from '../../hooks/useClientErrors'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../context/ToastContext'
import AdminShell from './AdminShell'

const AdminErrors = () => {
  useDocumentTitle('Admin · Errors')
  const { data: errors, isLoading, error } = useClientErrors()
  const clear = useClearClientErrors()
  const toast = useToast()

  const onClear = () => {
    if (!window.confirm('Clear all recorded errors?')) return
    clear.mutate(undefined, { onSuccess: () => toast.show({ title: 'Errors cleared' }) })
  }

  return (
    <AdminShell>
      <section className="admin-page">
        <div className="admin-toprow">
          <h1 className="serif" style={{ fontSize: 26 }}>Errors</h1>
          {errors && errors.length > 0 && (
            <button className="btn-outline" onClick={onClear} disabled={clear.isPending}>Clear all</button>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24, maxWidth: 560 }}>
          Uncaught errors from shoppers' browsers, newest first (production only, de-duplicated per visit).
        </p>

        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--text-muted)' }}>Could not load errors.</p>}
        {errors && errors.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nothing has gone wrong. 🎉</p>}

        <div style={{ display: 'grid', gap: 12 }}>
          {errors?.map((e) => (
            <details className="error-item" key={e.id}>
              <summary>
                <span className="error-msg">{e.message}</span>
                <span className="error-when">{new Date(e.created_at).toLocaleString()}</span>
              </summary>
              <dl>
                {e.url && (<><dt>Page</dt><dd>{e.url}</dd></>)}
                {e.user_agent && (<><dt>Browser</dt><dd>{e.user_agent}</dd></>)}
              </dl>
              {e.stack && <pre>{e.stack}</pre>}
            </details>
          ))}
        </div>
      </section>
    </AdminShell>
  )
}

export default AdminErrors
