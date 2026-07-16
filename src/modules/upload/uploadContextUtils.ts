import type { ValidationCheck, WorkbookFileItem, UploadKind } from '../../types/upload'

export const createWorkbookItem = (
  kind: UploadKind,
  file: File,
  validationChecks: ValidationCheck[],
  overallStatus: 'pass' | 'warning' | 'error',
): WorkbookFileItem => ({
  id: `${kind}-${file.name}-${file.size}`,
  kind,
  name: file.name,
  size: file.size,
  lastModified: new Date(file.lastModified).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
  fileType: file.type || 'application/octet-stream',
  file,
  sheetCount: 1,
  workbookReadable: validationChecks.some((check) => check.id === 'workbook-readable' && check.status === 'pass'),
  worksheetExists: validationChecks.some((check) => check.id === 'worksheet-exists' && check.status !== 'error'),
  headerRowDetected: validationChecks.some((check) => check.id === 'header-row' && check.status === 'pass'),
  rowsPresent: validationChecks.some((check) => check.id === 'rows-present' && check.status === 'pass'),
  columnsPresent: validationChecks.some((check) => check.id === 'columns-present' && check.status === 'pass'),
  validationChecks,
  status: overallStatus,
})
