interface WorkbookLike {
  sheets: string[]
  rows: string[][]
}

export const extractWorkbookLike = async (file: File): Promise<WorkbookLike> => {
  const buffer = await file.arrayBuffer()

  // dynamic import to avoid TypeScript type dependency on sheetjs types
  // Prefer the browser global provided by the SheetJS CDN bundle to avoid bundling issues.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalX = (globalThis as any).XLSX
  if (!globalX) {
    throw new Error('XLSX parser not available. Ensure the SheetJS bundle is loaded in index.html')
  }
  const XLSX = globalX
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetNames: string[] = workbook.SheetNames || []
  const primary = sheetNames[0] ?? ''
  const worksheet = workbook.Sheets[primary]

  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown
  const rows = Array.isArray(rawRows)
    ? (rawRows as unknown[]).map((row) => (Array.isArray(row) ? row.map((c) => (c === null || c === undefined ? '' : String(c))) : []))
    : []

  return { sheets: sheetNames, rows }
}

export default extractWorkbookLike
