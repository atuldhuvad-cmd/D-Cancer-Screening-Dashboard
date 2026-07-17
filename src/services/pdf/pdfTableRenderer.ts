import autoTable from 'jspdf-autotable'
import type { jsPDF } from 'jspdf'
import { CONTENT_WIDTH, PDF_THEME, PDF_SIZES, PAGE_MARGIN, formatReadinessDisplay } from './pdfTheme'

const baseTableOptions = {
  startY: 0,
  theme: 'striped' as const,
  headStyles: {
    fillColor: PDF_THEME.primary,
    textColor: '#ffffff',
    halign: 'center' as const,
    fontStyle: 'bold' as const,
    fontSize: 9,
  },
  bodyStyles: {
    minCellHeight: 7,
    valign: 'middle' as const,
    fontSize: 8,
    textColor: PDF_THEME.text,
  },
  styles: {
    cellPadding: 3,
    overflow: 'linebreak' as const,
    font: 'helvetica',
  },
  columnStyles: {
    0: { cellWidth: 'auto' as const },
    1: { cellWidth: 'auto' as const },
    2: { cellWidth: 'auto' as const },
  },
  head: [],
  body: [],
  margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: 0, bottom: 20 },
  rowPageBreak: 'avoid' as const,
}

export const addSummaryTable = (doc: jsPDF, headers: string[], rows: (string | number)[][], startY: number) => {
  autoTable(doc, {
    ...baseTableOptions,
    startY,
    head: [headers],
    body: rows,
    tableWidth: 'auto',
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3 && typeof data.cell.raw === 'string') {
        data.cell.text = [data.cell.raw]
      }
    },
  })
  autoTable(doc, {
    ...baseTableOptions,
    startY,
    head: [headers],
    body: rows,
    tableWidth: 'auto',
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3 && typeof data.cell.raw === 'string') {
        data.cell.text = [data.cell.raw]
      }
    },
  })
  const table: any = (doc as any).getLastAutoTable?.() ?? (doc as any).lastAutoTable
  return table?.finalY ?? startY
}

export const addPriorityTable = (doc: jsPDF, headers: string[], rows: (string | number)[][], startY: number) => {
  autoTable(doc, {
    ...baseTableOptions,
    startY,
    head: [headers],
    body: rows,
    tableWidth: 'auto',
    styles: {
      ...baseTableOptions.styles,
      fillColor: '#f7fafe',
    },
  })
  const table: any = (doc as any).getLastAutoTable?.() ?? (doc as any).lastAutoTable
  return table?.finalY ?? startY
}

export const addRecommendationList = (doc: jsPDF, items: string[], startY: number) => {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(PDF_SIZES.body)
  doc.setTextColor(PDF_THEME.text)

  let y = startY
  items.forEach((item, index) => {
    const line = `${index + 1}. ${item}`
    const split = doc.splitTextToSize(line, CONTENT_WIDTH)
    doc.text(split, PAGE_MARGIN, y)
    y += split.length * 5 + 3
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage()
      y = 30
    }
  })

  return y
}

export const createSectionTable = (reportSection: { label: string; workforce: number; trained: number; readiness: number; gap: number }[]) => {
  return reportSection.map((row) => [
    row.label,
    row.workforce,
    row.trained,
    formatReadinessDisplay(row.readiness),
    row.gap,
  ])
}
