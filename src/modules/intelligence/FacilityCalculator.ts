import type { ParsedRecord } from '../../types/parser'
import type { FacilitySummary } from '../../types/calculation'
import { calculateReadiness } from '../../services/readiness'

export const calculateFacilitySummaries = (records: ParsedRecord[]): FacilitySummary[] => {
  const grouped = new Map<string, ParsedRecord[]>()

  records.forEach((record) => {
    const key = `${record.block}|${record.facility}`
    const current = grouped.get(key) ?? []
    current.push(record)
    grouped.set(key, current)
  })

  return Array.from(grouped.entries()).map(([key, entries]) => {
    const [block, facility] = key.split('|')
    const workforce = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    const trained = entries.reduce((sum, entry) => sum + entry.workforce, 0)

    return {
      block,
      facility,
      workforce,
      trained,
      gap: Math.max(0, workforce - trained),
      readiness: calculateReadiness(trained, workforce),
    }
  })
}
