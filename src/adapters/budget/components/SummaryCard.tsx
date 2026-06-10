type SummaryCardProps = {
  label: string
  value: string
  sublabel?: string
  variant?: 'default' | 'success' | 'danger'
  icon?: string
  className?: string
}

export function SummaryCard({ label, value, sublabel, variant = 'default', icon, className = '' }: SummaryCardProps) {
  const valueColor =
    variant === 'success'
      ? 'text-success'
      : variant === 'danger'
        ? 'text-danger'
        : 'text-text-primary'

  return (
    <div className={`flex flex-col gap-1.5 rounded-card bg-bg-card p-4 shadow-card sm:gap-2 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary sm:text-sm">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <span className={`text-xl font-bold sm:text-2xl ${valueColor}`}>{value}</span>
      {sublabel && <span className="text-xs text-text-secondary">{sublabel}</span>}
    </div>
  )
}
