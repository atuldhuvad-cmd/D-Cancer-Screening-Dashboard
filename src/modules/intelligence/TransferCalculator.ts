import type { CalculationSummary } from '../../types/calculation'

export const calculateTransferSummary = (summary: CalculationSummary): CalculationSummary => ({
  ...summary,
  gap: Math.max(0, summary.workforce - summary.trained),
})
