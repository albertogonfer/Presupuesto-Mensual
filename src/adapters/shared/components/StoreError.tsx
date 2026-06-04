type StoreErrorProps = {
  onRetry: () => void
}

export function StoreError({ onRetry }: StoreErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card bg-bg-card p-8 shadow-card text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-text-secondary">No se pudieron cargar los datos.</p>
      <button
        onClick={onRetry}
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Reintentar
      </button>
    </div>
  )
}
