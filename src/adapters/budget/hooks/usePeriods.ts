import { usePeriodsStore } from '../store/periodsStore'

export function usePeriods() {
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const createPeriod = usePeriodsStore((s) => s.createPeriod)
  const updatePeriod = usePeriodsStore((s) => s.updatePeriod)
  const setActivePeriod = usePeriodsStore((s) => s.setActivePeriod)

  const activePeriod = periods.find((p) => p.id === activePeriodId) ?? null

  return { periods, activePeriod, createPeriod, updatePeriod, setActivePeriod }
}
