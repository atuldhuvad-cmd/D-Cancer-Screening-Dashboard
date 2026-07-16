import type { WorkbookFileItem } from '../../types/upload'

interface FileInfoProps {
  workbook: WorkbookFileItem | null
}

function FileInfo({ workbook }: FileInfoProps) {
  if (!workbook) {
    return null
  }

  return (
    <div className="upload-fileinfo">
      <p className="upload-fileinfo__name">{workbook.name}</p>
      <div className="upload-fileinfo__details">
        <span>{(workbook.size / 1024).toFixed(1)} KB</span>
        <span>{workbook.sheetCount} sheet(s)</span>
        <span>{workbook.lastModified}</span>
      </div>
    </div>
  )
}

export default FileInfo
