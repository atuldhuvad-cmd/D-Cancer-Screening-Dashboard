import ExcelJS from 'exceljs'
import type { ValidationReport } from '../../types/validation'

const createValidationWorkbook = (report: ValidationReport): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'WTIP v2'
  wb.created = new Date()
  ;(wb as any).properties = {
    title: `Validation Report - ${report.metadata.filename}`,
    subject: 'Data Quality Report',
    company: 'Government of Gujarat',
  }
  return wb
}

const addSheet = (wb: ExcelJS.Workbook, report: ValidationReport) => {
  const ws = wb.addWorksheet('Validation Report')
  ws.columns = [
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Field', key: 'field', width: 18 },
    { header: 'Row', key: 'row', width: 10 },
    { header: 'Message', key: 'message', width: 60 },
  ]

  report.issues.forEach((issue) => {
    ws.addRow({
      severity: issue.severity.toUpperCase(),
      category: issue.category,
      field: issue.field,
      row: issue.row ?? 'N/A',
      message: issue.message,
    })
  })

  ws.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
  })
}

export const exportValidationReportToExcel = async (report: ValidationReport, filename = 'wtip-validation-report.xlsx') => {
  const wb = createValidationWorkbook(report)
  addSheet(wb, report)

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
