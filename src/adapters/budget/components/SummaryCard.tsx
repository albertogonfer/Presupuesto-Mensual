type SummaryCardProps = {
  label: string
  value: string
  sublabel?: string
  variant?: 'default' | 'success' | 'danger'
  icon?: string
}

export function SummaryCard({ label, value, sublabel, variant = 'default', icon }: SummaryCardProps) {
  const valueColor =
    variant === 'success'
      ? 'text-success'
      : variant === 'danger'
        ? 'text-danger'
        : 'text-text-primary'

  return (
    <div className="flex flex-col gap-2 rounded-card bg-bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-input text-base">
            {icon}
          </span>
        )}
      </div>
      <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
      {sublabel && <span className="text-xs text-text-secondary">{sublabel}</span>}
    </div>
  )
}
