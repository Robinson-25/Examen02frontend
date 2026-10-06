// Campo de formulario con etiqueta y mensaje de error
export default function Field({ label, error, as: Tag = 'input', className = '', children, ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <Tag className={`input ${error ? 'input-error' : ''}`} aria-invalid={!!error} {...props}>
        {children}
      </Tag>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
