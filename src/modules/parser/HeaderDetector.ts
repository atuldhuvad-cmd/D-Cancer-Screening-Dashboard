import { blockPatterns, facilityPatterns, designationPatterns, workforcePatterns } from '../../services/columnPatterns'

export const detectHeaderRow = (rows: string[][]): number => {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const normalized = row.map((cell) => cell.trim().toLowerCase())

    if (normalized.some((cell) => blockPatterns.includes(cell) || facilityPatterns.includes(cell) || designationPatterns.includes(cell))) {
      return index
    }
  }

  return 0
}

export const detectColumns = (headerRow: string[]): Record<string, number> => {
  const columns: Record<string, number> = {}
  const normalizedHeaders = headerRow.map((cell) => cell.trim().toLowerCase())

  normalizedHeaders.forEach((value, index) => {
    if (blockPatterns.includes(value)) {
      columns.block = index
    } else if (facilityPatterns.includes(value)) {
      columns.facility = index
    } else if (designationPatterns.includes(value)) {
      columns.designation = index
    } else if (workforcePatterns.includes(value)) {
      columns.workforce = index
    }
  })

  return columns
}
