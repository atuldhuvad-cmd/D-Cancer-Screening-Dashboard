import ExcelJS from 'exceljs'
import { formatPctDisplay, applyHeaderStyle, applySheetTitle, autoFitColumns, THEME, applyAlternatingRows, applyReadinessConditional } from './exportHelpers'
import type { CalculationReportData, PriorityItem } from '../../types/calculation'

const createWorkbook = (): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'WTIP v2'
  wb.created = new Date()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(wb as any).properties = { title: 'WTIP Meeting Pack', subject: 'Workforce Intelligence Report', company: 'Government of Gujarat' }
  return wb
}

const addTableWorksheet = (wb: ExcelJS.Workbook, name: string, headers: string[], rows: (string | number)[][], title?: string) => {
  const ws = wb.addWorksheet(name)
  const lastCol = headers.length

  // tab color
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(ws.properties as any).tabColor = { argb: THEME.teal }

  if (title) applySheetTitle(ws, title, lastCol)

  // handle Readiness raw column insertion: if headers include 'Readiness' we add a hidden raw column after it
  const readinessIndex = headers.findIndex((h) => h.toLowerCase().includes('readiness'))
  let adjustedHeaders = [...headers]
  let hasRaw = false
  if (readinessIndex >= 0) {
    adjustedHeaders = [...headers.slice(0, readinessIndex + 1), 'Readiness (raw)', ...headers.slice(readinessIndex + 1)]
    hasRaw = true
  }

  const headerRow = ws.addRow(adjustedHeaders)
  applyHeaderStyle(ws, headerRow)
  headerRow.commit()

  // add data rows, inserting raw numeric readiness when applicable
  rows.forEach((r) => {
    const rowData: (string | number)[] = []
    if (!hasRaw) {
      r.forEach((c) => rowData.push(c))
    } else {
      // rebuild row with raw readiness after the display readiness
      r.forEach((c, i) => {
        rowData.push(c)
        if (i === readinessIndex) {
          // attempt to parse display readiness back to numeric (expecting percent or formatted string)
          const parsed = typeof c === 'string' ? parseFloat((c as string).replace('%', '').replace('*', '')) : (c as number)
          const raw = isNaN(parsed) ? 0 : parsed / 100
          rowData.push(raw)
        }
      })
    }
    ws.addRow(rowData)
  })

  // borders for data rows
  ws.eachRow((row: ExcelJS.Row) => {
    row.eachCell((cell: ExcelJS.Cell) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
  })

  // apply alternating rows, conditional fills for readiness
  if (hasRaw) {
    const displayCol = readinessIndex + 1
    const rawCol = readinessIndex + 2
    applyAlternatingRows(ws, 3)
    applyReadinessConditional(ws, displayCol, rawCol)
    // hide raw column
    const c = ws.getColumn(rawCol)
    c.hidden = true
    c.width = 6
    // format raw column as percent
    ws.eachRow((row, rowNumber) => {
      if (rowNumber >= 3) {
        const rawCell = row.getCell(rawCol)
        if (typeof rawCell.value === 'number') rawCell.numFmt = '0.0%'
      }
    })
  } else {
    applyAlternatingRows(ws, 3)
  }

  ws.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: rows.length + 1 + 1, column: adjustedHeaders.length },
  }

  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true }
  ws.pageSetup.printTitlesRow = '2:2'

  // header and footer
  ws.headerFooter = {
    oddHeader: `&C&"Segoe UI,Bold"${title ?? name}`,
    oddFooter: `&L&"Segoe UI"${new Date().toLocaleDateString()}&RPage &P of &N`,
  }

  // freeze panes
  ws.views = [{ state: 'frozen', ySplit: 2 }]

  autoFitColumns(ws)
}

export const exportReportToExcel = async (report: CalculationReportData, filename = 'wtip-meeting-pack.xlsx') => {
  const wb = createWorkbook()

  // Executive Dashboard sheet
  addTableWorksheet(
    wb,
    'Executive',
    ['Metric', 'Value'],
    [
      ['Total Workforce', report.district.workforce],
      ['Total Trained', report.district.trained],
      ['District Readiness', `${report.district.readiness.toFixed(1)}%`],
      ['Planning Gap', report.district.gap],
      ['Batch Requirement', report.batchRequirement],
    ],
    'Executive Dashboard',
  )

  // District Workforce Summary
  addTableWorksheet(
    wb,
    'District Summary',
    ['Scope', 'Workforce', 'Trained', 'Readiness', 'Gap'],
    [[
      'District', report.district.workforce, report.district.trained,
      formatPctDisplay(report.district.trained, report.district.workforce), report.district.gap,
    ]],
    'District Workforce Summary',
  )

  // Block Summary
  addTableWorksheet(
    wb,
    'Blocks',
    ['Block', 'Workforce', 'Trained', 'Readiness', 'Gap'],
    report.blocks.map((b) => [b.block, b.workforce, b.trained, formatPctDisplay(b.trained, b.workforce), b.gap]),
    'Block Summary',
  )

  // Facility Summary
  addTableWorksheet(
    wb,
    'Facilities',
    ['Block', 'Facility', 'Workforce', 'Trained', 'Readiness', 'Gap'],
    report.facilities.map((f) => [f.block, f.facility, f.workforce, f.trained, formatPctDisplay(f.trained, f.workforce), f.gap]),
    'Facility Summary',
  )

  // Designation Summary
  addTableWorksheet(
    wb,
    'Designations',
    ['Designation', 'Workforce', 'Trained', 'Readiness', 'Gap'],
    report.designations.map((d) => [d.designation, d.workforce, d.trained, formatPctDisplay(d.trained, d.workforce), d.gap]),
    'Designation Summary',
  )

  // Training Gap Summary (reuse designations)
  addTableWorksheet(
    wb,
    'Training Gap',
    ['Designation', 'Workforce', 'Trained', 'Readiness', 'Gap'],
    report.designations.map((d) => [d.designation, d.workforce, d.trained, formatPctDisplay(d.trained, d.workforce), d.gap]),
    'Training Gap Summary',
  )

  // Priority lists
  const mapPriority = (items: PriorityItem[]) => items.map((it) => [it.name, it.gap, `${it.readiness.toFixed(1)}%`])

  addTableWorksheet(wb, 'Priority Blocks', ['Block', 'Gap', 'Readiness'], mapPriority(report.priorityBlocks), 'Priority Blocks')
  addTableWorksheet(wb, 'Priority Facilities', ['Facility', 'Gap', 'Readiness'], mapPriority(report.priorityFacilities), 'Priority Facilities')
  addTableWorksheet(wb, 'Critical Designations', ['Designation', 'Gap', 'Readiness'], mapPriority(report.priorityDesignations), 'Critical Designations')

  // Batch planning
  addTableWorksheet(wb, 'Batch Planning', ['Batch Requirement'], [[report.batchRequirement]], 'Batch Planning Summary')

  // Recommendations (simple single column)
  addTableWorksheet(wb, 'Recommendations', ['Recommendation'], [
    [`Focus: ${report.priorityBlocks.slice(0,3).map((b) => b.name).join(', ')}`],
    [`Facilities: ${report.priorityFacilities.slice(0,3).map((f) => f.name).join(', ')}`],
    [`Batches required: ${report.batchRequirement}`],
  ], 'Recommendations')

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

export default exportReportToExcel
