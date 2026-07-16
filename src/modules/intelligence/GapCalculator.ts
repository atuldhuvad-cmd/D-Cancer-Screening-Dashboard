import type { CalculationSummary } from '../../types/calculation'

export const calculateGapSummary = (summary: CalculationSummary): CalculationSummary => ({
  ...summary,
  gap: Math.max(0, summary.workforce - summary.trained),
})
