import type { ValidationCheck, ValidationStatus } from '../../types/upload'

interface UploadStatusProps {
  checks: ValidationCheck[]
  overallStatus: ValidationStatus
  summary: string
}

const statusStyles: Record<ValidationStatus, string> = {
  pass: 'upload-status upload-status--pass',
  warning: 'upload-status upload-status--warning',
  error: 'upload-status upload-status--error',
}

function UploadStatus({ checks, overallStatus, summary }: UploadStatusProps) {
  return (
    <div className={statusStyles[overallStatus]}>
      <h4>{summary}</h4>
      <ul>
        {checks.map((check) => (
          <li key={check.id}>
            <span className={`status-pill status-pill--${check.status}`}>{check.status.toUpperCase()}</span>
            <strong>{check.label}</strong>
            <p>{check.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UploadStatus
