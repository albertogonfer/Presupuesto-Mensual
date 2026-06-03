type EmptyStateProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-text-secondary">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
