import { calculateReadiness } from '../../services/readiness'
import type { CalculationSummary } from '../../types/calculation'

export const calculateReadinessSummary = (summary: CalculationSummary): CalculationSummary => ({
  ...summary,
  readiness: calculateReadiness(summary.trained, summary.workforce),
})
