import { normalizeDesignation } from '../../services/designationAliases'
import { normalizeFacility } from '../../services/facilityNormalizer'
import type { ParsedRecord, ParserValidationIssue } from '../../types/parser'

interface LongParseInput {
  rows: string[][]
  sheetName: string
}

export const parseLongFormat = ({ rows, sheetName }: LongParseInput): { records: ParsedRecord[]; warnings: ParserValidationIssue[]; errors: ParserValidationIssue[] } => {
  const records: ParsedRecord[] = []
  const warnings: ParserValidationIssue[] = []
  const errors: ParserValidationIssue[] = []

  rows.forEach((row, rowIndex) => {
    if (row.every((cell) => !cell.trim())) {
      return
    }

    const block = row[0]?.trim() ?? ''
    const facility = row[1]?.trim() ?? ''
    const designation = normalizeDesignation(row[2]?.trim() ?? '')
    const workforceValue = row[3]?.trim() ?? ''
    const workforce = Number.parseInt(workforceValue, 10)
    const sourceRow = rowIndex + 2

    if (!block || !facility || !designation) {
      errors.push({ type: 'error', message: `Missing required values at row ${sourceRow}` })
      return
    }

    if (!Number.isFinite(workforce)) {
      errors.push({ type: 'error', message: `Invalid numeric value at row ${sourceRow}` })
      return
    }

    records.push({
      block,
      facility: normalizeFacility(facility),
      designation,
      workforce,
      sourceRow,
      sourceSheet: sheetName,
    })
  })

  return { records, warnings, errors }
}
