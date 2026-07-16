import type { ParsedRecord } from '../../types/parser'
import type { DistrictSummary } from '../../types/calculation'
import { calculateReadiness } from '../../services/readiness'

export const calculateDistrictSummary = (records: ParsedRecord[]): DistrictSummary => {
  const workforce = records.reduce((sum, record) => sum + record.workforce, 0)
  const trained = records.reduce((sum, record) => sum + record.workforce, 0)

  return {
    district: 'District',
    workforce,
    trained,
    gap: Math.max(0, workforce - trained),
    readiness: calculateReadiness(trained, workforce),
  }
}
