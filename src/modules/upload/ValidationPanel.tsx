import { useMemo } from 'react'
import { useUploadContext } from './useUploadContext'
import UploadStatus from './UploadStatus'
import type { UploadKind } from '../../types/upload'

interface ValidationPanelProps {
  kind: UploadKind
}

function ValidationPanel({ kind }: ValidationPanelProps) {
  const { validationResults } = useUploadContext()

  const checks = useMemo(() => validationResults[kind] ?? [], [kind, validationResults])

  if (!checks.length) {
    return null
  }

  const overallStatus = checks.some((check) => check.status === 'error')
    ? 'error'
    : checks.some((check) => check.status === 'warning')
      ? 'warning'
      : 'pass'

  const summary = overallStatus === 'error'
    ? 'Validation requires attention before the workbook can proceed.'
    : overallStatus === 'warning'
      ? 'Validation completed with warnings.'
      : 'Validation completed successfully.'

  return <UploadStatus checks={checks} overallStatus={overallStatus} summary={summary} />
}

export default ValidationPanel
