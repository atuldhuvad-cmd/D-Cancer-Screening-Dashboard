import ExcelJS from 'exceljs'

export const THEME = {
  navy: 'FF0F2A4A',
  teal: 'FF0F766E',
  green: 'FF2F855A',
  amber: 'FFD97706',
  red: 'FFB91C1C',
  surface: 'FFFFFFFF',
  surfaceAlt: 'FFF8FAFC',
}

export const applySheetTitle = (ws: ExcelJS.Worksheet, title: string, lastCol: number): void => {
  const endColLetter = String.fromCharCode(64 + Math.max(1, lastCol))
  const range = `A1:${endColLetter}1`
  ws.mergeCells(range)
  const cell = ws.getCell('A1')
  cell.value = title
  cell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: THEME.navy } }
  cell.alignment = { vertical: 'middle', horizontal: 'center' }
  ws.getRow(1).height = 28
}

export const applyHeaderStyle = (ws: ExcelJS.Worksheet, headerRow: ExcelJS.Row): void => {
  headerRow.eachCell((cell: ExcelJS.Cell) => {
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: THEME.navy } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.surfaceAlt } }
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  ws.views = [{ state: 'frozen', ySplit: headerRow.number }]
}

export const autoFitColumns = (ws: ExcelJS.Worksheet, minW = 12, maxW = 50): void => {
  const cols = ws.columns || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cols.forEach((col: any) => {
    if (!col) return
    let max = minW
    col.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
      const v = cell.value
      const len = v ? String(v).length : 0
      if (len > max) max = len
    })
    col.width = Math.min(Math.max(max + 2, minW), maxW)
  })
}

export const formatPctDisplay = (value: number, workforce: number): string => {
  const pct = (value / (workforce || 1)) * 100
  return pct > 100 ? `${Math.min(pct, 100).toFixed(1)}%*` : `${pct.toFixed(1)}%`
}

export const applyAlternatingRows = (ws: ExcelJS.Worksheet, startRow = 3, evenFill = THEME.surfaceAlt) => {
  ws.eachRow((row, idx) => {
    if (idx >= startRow) {
      if ((idx - startRow) % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: evenFill } }
        })
      }
    }
  })
}

export const applyReadinessConditional = (ws: ExcelJS.Worksheet, readinessCol: number, rawCol?: number) => {
  ws.eachRow((row, rowNumber) => {
    if (rowNumber < 3) return
    const rawCell = rawCol ? row.getCell(rawCol) : null
    const cell = row.getCell(readinessCol)
    let val = null
    if (rawCell && typeof rawCell.value === 'number') {
      val = rawCell.value as number
    } else if (typeof cell.value === 'number') {
      val = cell.value as number
    }
    if (val !== null && typeof val === 'number') {
      const pct = (val || 0) * 100
      if (pct < 40) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.red } }
      } else if (pct < 60) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.amber } }
      } else if (pct < 80) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.teal } }
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.green } }
      }
    }
  })
}

export default {}
