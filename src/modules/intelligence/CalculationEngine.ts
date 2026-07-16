import { buildCalculationReport } from '../../services/calculationService'
import type { ParsedRecord } from '../../types/parser'
import type { CalculationReportData } from '../../types/calculation'

export const calculateIntelligence = (records: ParsedRecord[]): CalculationReportData => {
  return buildCalculationReport(records)
}
