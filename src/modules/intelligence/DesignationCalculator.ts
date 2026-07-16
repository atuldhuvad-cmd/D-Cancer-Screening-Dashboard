import type { ParsedRecord } from '../../types/parser'
import type { DesignationSummary } from '../../types/calculation'
import { calculateReadiness } from '../../services/readiness'

export const calculateDesignationSummaries = (records: ParsedRecord[]): DesignationSummary[] => {
  const grouped = new Map<string, ParsedRecord[]>()

  records.forEach((record) => {
    const current = grouped.get(record.designation) ?? []
    current.push(record)
    grouped.set(record.designation, current)
  })

  return Array.from(grouped.entries()).map(([designation, entries]) => {
    const workforce = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    const trained = entries.reduce((sum, entry) => sum + entry.workforce, 0)

    return {
      designation,
      workforce,
      trained,
      gap: Math.max(0, workforce - trained),
      readiness: calculateReadiness(trained, workforce),
    }
  })
}
