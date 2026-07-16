import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'

interface DropZoneProps {
  onFileSelected: (file: File) => void
  accept: string
  label: string
}

function DropZone({ onFileSelected, accept, label }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)

    const file = event.dataTransfer.files.item(0)
    if (file) {
      onFileSelected(file)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0)
    if (file) {
      onFileSelected(file)
    }
    event.target.value = ''
  }

  return (
    <div
      className={`upload-dropzone ${dragActive ? 'upload-dropzone--active' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <p className="upload-dropzone__title">{label}</p>
      <p className="upload-dropzone__hint">Drag and drop a workbook here or browse from your device.</p>
      <button type="button" className="upload-button" onClick={() => inputRef.current?.click()}>
        Browse Files
      </button>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleInputChange} />
    </div>
  )
}

export default DropZone
