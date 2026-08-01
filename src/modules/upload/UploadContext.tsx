import { useCallback, useEffect, useMemo, useState } from 'react'
import { validateWorkbook } from '../../services/workbookValidator'
import { extractWorkbookLike } from '../../services/excelReader'
import { buildParserReport } from '../../services/parserService'
import { calculateIntelligence } from '../intelligence/CalculationEngine'
import type { CalculationReportData } from '../../types/calculation'
import type { UploadContextValue, UploadKind, ValidationCheck, WorkbookFileItem, WorkspaceStatus } from '../../types/upload'
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
  const [report, setReport] = useState<CalculationReportData | null>(null)
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>('idle')

  // Workspace Manager derivation: parse + calculate the staffing workbook once,
  // so consumer pages read the shared report instead of each re-running the pipeline.
  useEffect(() => {
    let mounted = true

    const derive = async () => {
      if (!staffingWorkbook?.file) {
        if (mounted) {
          setReport(null)
          setWorkspaceStatus('idle')
        }
        return
      }

      if (mounted) setWorkspaceStatus('loading')

      try {
        const workbookLike = await extractWorkbookLike(staffingWorkbook.file)
        const parserReport = buildParserReport(workbookLike)
        const calc = calculateIntelligence(parserReport.records)
        if (mounted) {
          setReport(calc)
          setWorkspaceStatus('ready')
        }
      } catch {
        if (mounted) {
          setReport(null)
          setWorkspaceStatus('error')
        }
      }
    }

    void derive()

    return () => {
      mounted = false
    }
  }, [staffingWorkbook])

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
      report,
      workspaceStatus,
      setWorkbook,
      clearWorkbook,
    }),
    [clearWorkbook, report, setWorkbook, staffingWorkbook, trainingWorkbook, validationResults, workspaceStatus],
  )

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}
