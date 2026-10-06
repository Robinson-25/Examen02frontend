export default function Alert({ type = 'error', children }) {
  if (!children) return null
  const styles = type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return (
    <div role="alert" className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  )
}
