import '../styles/workspaceStatus.css'
import type { WorkspaceStatus } from '../types/upload'

interface WorkspaceStatusBannerProps {
  status: WorkspaceStatus
}

/**
 * Presentational banner for the Workspace Manager's derivation status.
 * Renders a loading or error state; returns null for idle/ready so pages
 * render their normal content unchanged.
 */
function WorkspaceStatusBanner({ status }: WorkspaceStatusBannerProps) {
  if (status === 'loading') {
    return (
      <div className="workspace-status workspace-status--loading" role="status" aria-live="polite">
        <span className="workspace-status__spinner" aria-hidden="true" />
        <div>
          <p className="workspace-status__title">Processing workbook…</p>
          <p className="workspace-status__detail">Parsing and calculating intelligence from the uploaded staffing data.</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="workspace-status workspace-status--error" role="alert" aria-live="assertive">
        <span className="workspace-status__icon" aria-hidden="true">!</span>
        <div>
          <p className="workspace-status__title">Workbook could not be processed</p>
          <p className="workspace-status__detail">The staffing workbook failed to parse. Please check the file and re-upload it.</p>
        </div>
      </div>
    )
  }

  return null
}

export default WorkspaceStatusBanner
