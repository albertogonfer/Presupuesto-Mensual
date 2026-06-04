type EmptyStateProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
  icon?: string
}

export function EmptyState({ message, actionLabel, onAction, icon = '📭' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card bg-bg-card py-14 text-center shadow-card">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-input text-3xl">
        {icon}
      </span>
      <p className="max-w-xs text-sm text-text-secondary">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
