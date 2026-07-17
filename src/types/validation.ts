export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  category: string
  field: string
  row: number | null
  message: string
}

export interface ValidationSummary {
  total: number
  errors: number
  warnings: number
  info: number
}

export interface ValidationMetadata {
  filename: string
  generatedAt: string
  rowCount: number
  columns: string[]
}

export interface ValidationReport {
  metadata: ValidationMetadata
  summary: ValidationSummary
  issues: ValidationIssue[]
}
