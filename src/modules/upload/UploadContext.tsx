import { useCallback, useMemo, useState } from 'react'
import { validateWorkbook } from '../../services/workbookValidator'
import type { UploadContextValue, UploadKind, ValidationCheck, WorkbookFileItem } from '../../types/upload'
import { createWorkbookItem } from './uploadContextUtils'
import { UploadContext } from './UploadContextValue'

interface UploadProviderProps {
  children: React.ReactNode
}

export function UploadProvider({ children }: UploadProviderProps) {
  const [staffingWorkbook, setStaffingWorkbook] = useState<WorkbookFileItem | null>(null)
  const [trainingWorkbook, setTrainingWorkbook] = useState<WorkbookFileItem | null>(null)
  const [validationResults, setValidationResults] = useState<Record<UploadKind, ValidationCheck[]>>({
    staffing: [],
    training: [],
  })

  const setWorkbook = useCallback(async (kind: UploadKind, file: File | null) => {
    if (!file) {
      if (kind === 'staffing') {
        setStaffingWorkbook(null)
      } else {
        setTrainingWorkbook(null)
      }
      setValidationResults((previous) => ({ ...previous, [kind]: [] }))
      return
    }

    const result = await validateWorkbook(file, kind)
    const workbook = createWorkbookItem(kind, file, result.checks, result.overallStatus)

    if (kind === 'staffing') {
      setStaffingWorkbook(workbook)
    } else {
      setTrainingWorkbook(workbook)
    }

    setValidationResults((previous) => ({ ...previous, [kind]: result.checks }))
  }, [])

  const clearWorkbook = useCallback((kind: UploadKind) => {
    if (kind === 'staffing') {
      setStaffingWorkbook(null)
    } else {
      setTrainingWorkbook(null)
    }
    setValidationResults((previous) => ({ ...previous, [kind]: [] }))
  }, [])

  const value = useMemo<UploadContextValue>(
    () => ({
      staffingWorkbook,
      trainingWorkbook,
      validationResults,
      setWorkbook,
      clearWorkbook,
    }),
    [clearWorkbook, setWorkbook, staffingWorkbook, trainingWorkbook, validationResults],
  )

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}
