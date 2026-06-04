import { useNavigate } from 'react-router-dom'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { EmptyState } from '../../shared/components/EmptyState'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatEur(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const periods = usePeriodsStore((s) => s.periods)
  const setActivePeriod = usePeriodsStore((s) => s.setActivePeriod)
  const allExpenses = useExpensesStore((s) => s.expenses)

  const sorted = [...periods].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month,
  )

  function handleSelectPeriod(id: string) {
    setActivePeriod(id)
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Historial de períodos</h1>

      {sorted.length === 0 ? (
        <EmptyState
          message="No hay períodos registrados aún."
          actionLabel="Ir a Configuración"
          onAction={() => navigate('/settings')}
        />
      ) : (
        <div className="overflow-x-auto rounded-card bg-bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-input text-left text-text-secondary">
                <th className="p-4 font-medium">Período</th>
                <th className="p-4 font-medium">Sueldo neto</th>
                <th className="p-4 font-medium">Total gastado</th>
                <th className="p-4 font-medium">Restante</th>
                <th className="p-4 font-medium">% usado</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((period) => {
                const expenses = allExpenses.filter((e) => e.periodId === period.id)
                const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
                const remaining = period.netSalary - totalSpent
                const percentUsed = period.netSalary > 0
                  ? (totalSpent / period.netSalary) * 100
                  : 0
                const isOver = remaining < 0

                return (
                  <tr
                    key={period.id}
                    role="row"
                    onClick={() => handleSelectPeriod(period.id)}
                    className="cursor-pointer border-b border-bg-input/50 transition-colors last:border-0 hover:bg-bg-input/30"
                  >
                    <td className="p-4 font-medium text-text-primary">
                      {MONTH_NAMES[period.month - 1]} {period.year}
                    </td>
                    <td className="p-4 text-text-secondary">
                      {formatEur(period.netSalary)}
                    </td>
                    <td className="p-4 text-text-secondary">
                      {formatEur(totalSpent)}
                    </td>
                    <td className={`p-4 font-medium ${isOver ? 'text-danger' : 'text-success'}`}>
                      {formatEur(remaining)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          percentUsed > 100
                            ? 'bg-danger/20 text-danger'
                            : percentUsed > 80
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-success/20 text-success'
                        }`}
                      >
                        {percentUsed.toFixed(1)} %
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
