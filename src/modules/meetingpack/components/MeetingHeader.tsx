// No React import required with new JSX transform
import type { CalculationReportData } from '../../../types/calculation'

const MeetingHeader = ({ report }: { report: CalculationReportData | null }) => {
  const date = new Date().toLocaleString('en-IN', { dateStyle: 'medium' })
  return (
    <div className="meeting-header">
      <div>
        <h3 className="meeting-title">District Meeting Pack</h3>
        <p className="meeting-meta">Date: {date}</p>
      </div>
      <div className="meeting-kpis">
        <div className="kpi-card">
          <p className="kpi-title">Total Workforce</p>
          <p className="kpi-value">{report ? report.district.workforce : '—'}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-title">Trained</p>
          <p className="kpi-value">{report ? report.district.trained : '—'}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-title">Readiness</p>
          <p className="kpi-value">{report ? `${report.district.readiness.toFixed(1)}%` : '—'}</p>
        </div>
      </div>
    </div>
  )
}

export default MeetingHeader
