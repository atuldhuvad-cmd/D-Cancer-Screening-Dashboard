import { estimateBatches } from '../../services/batchEstimator'
import type { CalculationReportData } from '../../types/calculation'

export const calculateBatchRequirement = (report: CalculationReportData): number => {
  return estimateBatches(report.district.gap)
}
