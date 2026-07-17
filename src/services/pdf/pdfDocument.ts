import { jsPDF } from 'jspdf'
import { CONTENT_WIDTH, formatDateTime, formatNumber, formatReadinessDisplay, PDF_FONTS, PDF_SIZES, PDF_THEME, PAGE_MARGIN } from './pdfTheme'
import type { CalculationReportData } from '../../types/calculation'

export const createPdfDocument = () => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  doc.setProperties({ title: 'WTIP Meeting Pack', subject: 'Workforce Intelligence Report', author: 'WTIP v2', creator: 'WTIP v2' })
  return doc
}

export const drawHeader = (doc: jsPDF, pageTitle: string) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(PDF_THEME.primary)
  doc.rect(0, 0, pageWidth, 16, 'F')
  doc.setFont(PDF_FONTS.bold, 'normal')
  doc.setFontSize(10)
  doc.setTextColor('#ffffff')
  doc.text('Government of Gujarat', PAGE_MARGIN, 10)
  doc.setFontSize(8)
  doc.text(pageTitle, PAGE_MARGIN, 14)
  doc.setDrawColor(PDF_THEME.divider)
  doc.setLineWidth(0.4)
  doc.line(PAGE_MARGIN, 18, pageWidth - PAGE_MARGIN, 18)
}

export const drawFooter = (doc: jsPDF, pageNumber: number, pageCount: number, generatedAt: string) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const footerY = pageHeight - 12
  doc.setDrawColor(PDF_THEME.divider)
  doc.setLineWidth(0.4)
  doc.line(PAGE_MARGIN, footerY - 2, pageWidth - PAGE_MARGIN, footerY - 2)
  doc.setFont(PDF_FONTS.normal, 'normal')
  doc.setFontSize(PDF_SIZES.small)
  doc.setTextColor(PDF_THEME.footer)
  doc.text(`Generated: ${generatedAt}`, PAGE_MARGIN, footerY + 3)
  doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - PAGE_MARGIN, footerY + 3, { align: 'right' })
}

export const addCoverPage = (doc: jsPDF, report: CalculationReportData) => {
  const generatedAt = formatDateTime(new Date())
  const pageWidth = doc.internal.pageSize.getWidth()
  const titleY = 70

  doc.setFillColor(PDF_THEME.primary)
  doc.rect(0, 0, pageWidth, 45, 'F')
  doc.setFont(PDF_FONTS.bold, 'normal')
  doc.setFontSize(24)
  doc.setTextColor('#ffffff')
  doc.text('WTIP Meeting Pack', PAGE_MARGIN, 20)
  doc.setFontSize(12)
  doc.text('Workforce Training Intelligence Platform', PAGE_MARGIN, 28)

  doc.setFont(PDF_FONTS.normal, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(PDF_THEME.accent)
  doc.text('Government of Gujarat', PAGE_MARGIN, 53)

  doc.setFontSize(14)
  doc.setTextColor(PDF_THEME.heading)
  doc.text('District Meeting Pack', PAGE_MARGIN, titleY)

  doc.setFontSize(PDF_SIZES.body)
  doc.setTextColor(PDF_THEME.text)
  doc.text(`District Readiness: ${formatReadinessDisplay(report.district.readiness)}`, PAGE_MARGIN, titleY + 14)
  doc.text(`Total Workforce: ${formatNumber(report.district.workforce)}`, PAGE_MARGIN, titleY + 22)
  doc.text(`Training batches recommended: ${formatNumber(report.batchRequirement)}`, PAGE_MARGIN, titleY + 30)

  doc.setFontSize(PDF_SIZES.small)
  doc.setTextColor(PDF_THEME.footer)
  doc.text(`Report generated on ${generatedAt}`, PAGE_MARGIN, pageWidth > 0 ? 280 : 280)
}

export const addSectionHeading = (doc: jsPDF, title: string, currentY: number) => {
  doc.setFont(PDF_FONTS.bold, 'normal')
  doc.setFontSize(PDF_SIZES.section)
  doc.setTextColor(PDF_THEME.heading)
  doc.text(title, PAGE_MARGIN, currentY)
  return currentY + 8
}

export const addParagraph = (doc: jsPDF, text: string, startY: number) => {
  doc.setFont(PDF_FONTS.normal, 'normal')
  doc.setFontSize(PDF_SIZES.body)
  doc.setTextColor(PDF_THEME.text)
  const splitText = doc.splitTextToSize(text, CONTENT_WIDTH)
  doc.text(splitText, PAGE_MARGIN, startY)
  return startY + splitText.length * 5 + 4
}
