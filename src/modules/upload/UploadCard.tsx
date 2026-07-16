import { useCallback, useMemo, useState } from 'react'
import DropZone from './DropZone'
import FileInfo from './FileInfo'
import ValidationPanel from './ValidationPanel'
import { useUploadContext } from './useUploadContext'
import type { UploadKind, WorkbookFileItem } from '../../types/upload'

interface UploadCardProps {
  kind: UploadKind
  title: string
  description: string
  acceptedExtensions: string
}

function UploadCard({ kind, title, description, acceptedExtensions }: UploadCardProps) {
  const { staffingWorkbook, trainingWorkbook, setWorkbook, clearWorkbook } = useUploadContext()
  const [isUploading, setIsUploading] = useState(false)

  const workbook = useMemo<WorkbookFileItem | null>(() => {
    return kind === 'staffing' ? staffingWorkbook : trainingWorkbook
  }, [kind, staffingWorkbook, trainingWorkbook])

  const handleFileSelected = useCallback(
    async (file: File) => {
      const normalizedName = file.name.toLowerCase()
      const isAccepted = normalizedName.endsWith('.xlsx') || normalizedName.endsWith('.xls')

      if (!isAccepted) {
        return
      }

      setIsUploading(true)
      await setWorkbook(kind, file)
      setIsUploading(false)
    },
    [kind, setWorkbook],
  )

  const handleRemove = () => {
    clearWorkbook(kind)
  }

  return (
    <section className="upload-card">
      <div className="upload-card__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="upload-card__tag">{acceptedExtensions}</span>
      </div>

      {!workbook ? (
        <DropZone onFileSelected={handleFileSelected} accept={acceptedExtensions} label={`Upload ${title}`} />
      ) : (
        <div className="upload-card__selected">
          <FileInfo workbook={workbook} />
          <div className="upload-card__actions">
            <button type="button" className="upload-button" onClick={() => void handleFileSelected(workbook.file as File)}>
              Replace File
            </button>
            <button type="button" className="upload-button upload-button--secondary" onClick={handleRemove}>
              Remove File
            </button>
          </div>
        </div>
      )}

      {isUploading ? <div className="upload-progress">Scanning workbook structure…</div> : null}

      <ValidationPanel kind={kind} />
    </section>
  )
}

export default UploadCard
