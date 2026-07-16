import { detectAvailableColumns } from './ColumnDetector'
import { detectHeaderRow } from './HeaderDetector'
import { detectSheetNames } from './SheetDetector'
import { parseLongFormat } from './LongParser'
import { parseWideFormat } from './WideParser'
import { normalizeRecords } from './Normalizer'
import type { ParserFormat, ParserReportData } from '../../types/parser'

interface WorkbookLike {
  sheets: string[]
  rows: string[][]
}

export const detectFormat = (rows: string[][]): ParserFormat => {
  const headerRow = rows[0] ?? []
  const normalized = headerRow.map((cell) => cell.trim().toLowerCase())

  if (normalized.some((cell) => cell === 'designation' || cell === 'cadre' || cell === 'post')) {
    return 'long'
  }

  return 'wide'
}

export const parseWorkbook = (workbook: WorkbookLike): ParserReportData => {
  const sheetNames = detectSheetNames(workbook.sheets)
  const headerRowIndex = detectHeaderRow(workbook.rows)
  const headerRow = workbook.rows[headerRowIndex] ?? []
  const detectedFormat = detectFormat(workbook.rows)

  const parseResult = detectedFormat === 'long'
    ? parseLongFormat({ rows: workbook.rows.slice(headerRowIndex + 1), sheetName: sheetNames[0] ?? 'Sheet1' })
    : parseWideFormat({ headerRow, rows: workbook.rows.slice(headerRowIndex + 1), sheetName: sheetNames[0] ?? 'Sheet1' })

  const normalized = normalizeRecords(parseResult.records)
  const warnings = [...parseResult.warnings, ...normalized.warnings]
  const errors = [...parseResult.errors, ...normalized.errors]

  const records = normalized.records
  const duplicateCount = warnings.filter((issue) => issue.message.includes('Duplicate facility')).length

  return {
    format: detectedFormat,
    headerRow: headerRowIndex,
    detectedColumns: detectAvailableColumns(headerRow),
    designationCount: new Set(records.map((record) => record.designation)).size,
    facilityCount: new Set(records.map((record) => `${record.block}|${record.facility}`)).size,
    duplicateCount,
    warnings,
    errors,
    records,
  }
}
