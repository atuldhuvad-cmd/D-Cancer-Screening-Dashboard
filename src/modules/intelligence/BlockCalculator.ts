import type { ParsedRecord } from '../../types/parser'
import type { BlockSummary } from '../../types/calculation'
import { calculateReadiness } from '../../services/readiness'

export const calculateBlockSummaries = (records: ParsedRecord[]): BlockSummary[] => {
  const grouped = new Map<string, ParsedRecord[]>()

  records.forEach((record) => {
    const current = grouped.get(record.block) ?? []
    current.push(record)
    grouped.set(record.block, current)
  })

  return Array.from(grouped.entries()).map(([block, entries]) => {
    const workforce = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    const trained = entries.reduce((sum, entry) => sum + entry.workforce, 0)

    return {
      block,
      workforce,
      trained,
      gap: Math.max(0, workforce - trained),
      readiness: calculateReadiness(trained, workforce),
    }
  })
}
