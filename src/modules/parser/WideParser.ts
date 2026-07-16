import { normalizeDesignation } from '../../services/designationAliases'
import { normalizeFacility } from '../../services/facilityNormalizer'
import type { ParsedRecord, ParserValidationIssue } from '../../types/parser'

interface WideParseInput {
  headerRow: string[]
  rows: string[][]
  sheetName: string
}

export const parseWideFormat = ({ headerRow, rows, sheetName }: WideParseInput): { records: ParsedRecord[]; warnings: ParserValidationIssue[]; errors: ParserValidationIssue[] } => {
  const records: ParsedRecord[] = []
  const warnings: ParserValidationIssue[] = []
  const errors: ParserValidationIssue[] = []
  const designationColumns = headerRow.filter((cell) => cell.trim().length > 0)

  rows.forEach((row, rowIndex) => {
    if (row.every((cell) => !cell.trim())) {
      return
    }

    const block = row[0]?.trim() ?? ''
    const facility = row[1]?.trim() ?? ''
    const sourceRow = rowIndex + 2

    designationColumns.forEach((columnName, columnIndex) => {
      const designation = normalizeDesignation(columnName)
      const workforceValue = row[columnIndex + 2] ?? ''
      const workforce = Number.parseInt(workforceValue, 10)

      if (!designation || !block || !facility) {
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
  })

  return { records, warnings, errors }
}
