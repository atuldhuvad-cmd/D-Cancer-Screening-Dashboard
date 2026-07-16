export type UploadKind = 'staffing' | 'training'
export type ValidationStatus = 'pass' | 'warning' | 'error'

export interface ValidationCheck {
  id: string
  label: string
  status: ValidationStatus
  message: string
}

export interface WorkbookFileItem {
  id: string
  kind: UploadKind
  name: string
  size: number
  lastModified: string
  fileType: string
  file: File | null
  sheetCount: number
  workbookReadable: boolean
  worksheetExists: boolean
  headerRowDetected: boolean
  rowsPresent: boolean
  columnsPresent: boolean
  validationChecks: ValidationCheck[]
  status: ValidationStatus
}

export interface UploadContextValue {
  staffingWorkbook: WorkbookFileItem | null
  trainingWorkbook: WorkbookFileItem | null
  validationResults: Record<UploadKind, ValidationCheck[]>
  setWorkbook: (kind: UploadKind, file: File | null) => Promise<void>
  clearWorkbook: (kind: UploadKind) => void
}
