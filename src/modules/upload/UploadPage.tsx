import { useEffect } from 'react'
import { useUploadContext } from './useUploadContext'
import UploadCard from './UploadCard'

function UploadPage() {
  const { staffingWorkbook, trainingWorkbook } = useUploadContext()

  useEffect(() => {
    document.title = 'WTIP | Upload & Validation'
  }, [])

  return (
    <section className="upload-page">
      <div className="page-intro">
        <p className="eyebrow">Upload & Validation</p>
        <h2>Workbook intake and structural validation</h2>
        <p>
          Upload the staffing and training workbooks to establish the validation foundation for future downstream
          processing.
        </p>
      </div>

      <div className="upload-page__summary">
        <div className="summary-pill">Staffing workbook: {staffingWorkbook ? 'Ready' : 'Pending'}</div>
        <div className="summary-pill">Training workbook: {trainingWorkbook ? 'Ready' : 'Pending'}</div>
      </div>

      <div className="upload-grid">
        <UploadCard
          kind="staffing"
          title="Staffing Details"
          description="Upload the staffing workbook for structural inspection and validation."
          acceptedExtensions=".xlsx, .xls"
        />
        <UploadCard
          kind="training"
          title="Training Details"
          description="Upload the training workbook for structural inspection and validation."
          acceptedExtensions=".xlsx, .xls"
        />
      </div>
    </section>
  )
}

export default UploadPage
