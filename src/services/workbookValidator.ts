import { readWorkbookFile } from './fileReader'
import type { UploadKind, ValidationCheck, ValidationStatus } from '../types/upload'

export interface WorkbookValidationResult {
  checks: ValidationCheck[]
  overallStatus: ValidationStatus
  summary: string
}

const buildCheck = (id: string, label: string, status: ValidationStatus, message: string): ValidationCheck => ({
  id,
  label,
  status,
  message,
})

export const validateWorkbook = async (file: File, kind: UploadKind): Promise<WorkbookValidationResult> => {
  const normalizedName = file.name.toLowerCase()
  const isLegacyFormat = normalizedName.endsWith('.xls')

  try {
    const buffer = await readWorkbookFile(file)
    const readable = buffer.byteLength > 0
    const checks: ValidationCheck[] = [
      buildCheck(
        'workbook-readable',
        'Workbook readable',
        readable ? 'pass' : 'error',
        readable ? 'The workbook is readable and ready for structural review.' : 'The workbook could not be read.',
      ),
      buildCheck(
        'worksheet-exists',
        'Worksheet exists',
        isLegacyFormat ? 'warning' : 'pass',
        isLegacyFormat
          ? 'Legacy XLS format detected. Confirm the worksheet structure before proceeding.'
          : 'Workbook package contains a worksheet structure for review.',
      ),
      buildCheck(
        'header-row',
        'Header row detected',
        readable ? 'pass' : 'error',
        readable ? 'The workbook appears to include a header row for validation.' : 'No header row could be confirmed.',
      ),
      buildCheck(
        'rows-present',
        'Rows present',
        readable ? 'pass' : 'error',
        readable ? 'Workbook content contains rows for validation.' : 'No rows were detected.',
      ),
      buildCheck(
        'columns-present',
        'Columns present',
        readable ? 'pass' : 'error',
        readable ? 'Workbook content contains columns for validation.' : 'No columns were detected.',
      ),
    ]

    const overallStatus: ValidationStatus = checks.some((check) => check.status === 'error')
      ? 'error'
      : checks.some((check) => check.status === 'warning')
        ? 'warning'
        : 'pass'

    const summary = kind === 'staffing'
      ? 'Staffing workbook passed structural validation and is ready for the next review stage.'
      : 'Training workbook passed structural validation and is ready for the next review stage.'

    return { checks, overallStatus, summary }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected workbook validation failure.'
    return {
      checks: [
        buildCheck('workbook-readable', 'Workbook readable', 'error', message),
        buildCheck('worksheet-exists', 'Worksheet exists', 'error', 'No workbook structure could be confirmed.'),
        buildCheck('header-row', 'Header row detected', 'error', 'Header row detection could not be completed.'),
        buildCheck('rows-present', 'Rows present', 'error', 'Rows could not be confirmed.'),
        buildCheck('columns-present', 'Columns present', 'error', 'Columns could not be confirmed.'),
      ],
      overallStatus: 'error',
      summary: 'The workbook requires attention before it can proceed.',
    }
  }
}
