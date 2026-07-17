import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ValidationReport } from '../../types/validation'

const formatDateTime = (date: Date) => date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const createPdf = () => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  doc.setProperties({ title: 'WTIP Validation Report', subject: 'Data Quality Report', author: 'WTIP v2', creator: 'WTIP v2' })
  return doc
}

const addHeaderFooter = (doc: jsPDF, pageNumber: number, pageCount: number, generatedAt: string) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFontSize(10)
  doc.text('Government of Gujarat - Validation Report', 14, 12)
  doc.text(`Generated: ${generatedAt}`, 14, 280)
  doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - 14, 280, { align: 'right' })
}

export const exportValidationReportToPdf = async (report: ValidationReport, filename = 'wtip-validation-report.pdf') => {
  const doc = createPdf()
  const generatedAt = formatDateTime(new Date())
  doc.setFontSize(18)
  doc.text('WTIP Validation Report', 14, 24)
  doc.setFontSize(10)
  doc.text(`Filename: ${report.metadata.filename}`, 14, 34)
  doc.text(`Rows inspected: ${report.metadata.rowCount}`, 14, 40)
  doc.text(`Generated: ${generatedAt}`, 14, 46)

  autoTable(doc, {
    startY: 54,
    head: [['Severity', 'Category', 'Field', 'Row', 'Message']],
    body: report.issues.map((issue) => [
      issue.severity.toUpperCase(),
      issue.category,
      issue.field,
      issue.row ?? 'N/A',
      issue.message,
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [0, 77, 100], textColor: '#ffffff' },
    columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 28 }, 2: { cellWidth: 24 }, 3: { cellWidth: 12 }, 4: { cellWidth: 90 } },
    theme: 'grid',
    didDrawPage: () => {
      const pageNumber = doc.getNumberOfPages()
      addHeaderFooter(doc, pageNumber, pageNumber, generatedAt)
    },
    margin: { left: 14, right: 14, top: 14, bottom: 14 },
    rowPageBreak: 'avoid',
  })

  doc.save(filename)
}
