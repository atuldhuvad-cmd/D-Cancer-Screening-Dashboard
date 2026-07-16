import { parseWorkbook } from '../modules/parser/ParserEngine'
import type { ParserReportData } from '../types/parser'

interface WorkbookLike {
  sheets: string[]
  rows: string[][]
}

export const buildParserReport = (workbook: WorkbookLike): ParserReportData => {
  return parseWorkbook(workbook)
}
