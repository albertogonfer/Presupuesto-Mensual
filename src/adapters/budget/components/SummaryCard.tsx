type SummaryCardProps = {
  label: string
  value: string
  variant?: 'default' | 'success' | 'danger'
}

export function SummaryCard({ label, value, variant = 'default' }: SummaryCardProps) {
  const valueColor =
    variant === 'success'
      ? 'text-success'
      : variant === 'danger'
        ? 'text-danger'
        : 'text-text-primary'

  return (
    <div className="flex flex-col gap-1 rounded-card bg-bg-card p-6 shadow-card">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
    </div>
  )
}
