import { blockPatterns, facilityPatterns, designationPatterns, workforcePatterns } from '../../services/columnPatterns'

export const detectColumnPositions = (headerRow: string[]): Record<string, number> => {
  const detected: Record<string, number> = {}
  const normalizedHeaders = headerRow.map((cell) => cell.trim().toLowerCase())

  normalizedHeaders.forEach((value, index) => {
    if (blockPatterns.includes(value)) {
      detected.block = index
    } else if (facilityPatterns.includes(value)) {
      detected.facility = index
    } else if (designationPatterns.includes(value)) {
      detected.designation = index
    } else if (workforcePatterns.includes(value)) {
      detected.workforce = index
    }
  })

  return detected
}

export const detectAvailableColumns = (headerRow: string[]): string[] => {
  return headerRow.filter((cell) => cell.trim().length > 0)
}
