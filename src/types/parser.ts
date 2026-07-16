export type ParserFormat = 'wide' | 'long'

export interface ParsedRecord {
  block: string
  facility: string
  designation: string
  workforce: number
  sourceRow: number
  sourceSheet: string
}

export interface ParserValidationIssue {
  type: 'warning' | 'error'
  message: string
}

export interface ParserReportData {
  format: ParserFormat
  headerRow: number
  detectedColumns: string[]
  designationCount: number
  facilityCount: number
  duplicateCount: number
  warnings: ParserValidationIssue[]
  errors: ParserValidationIssue[]
  records: ParsedRecord[]
}
