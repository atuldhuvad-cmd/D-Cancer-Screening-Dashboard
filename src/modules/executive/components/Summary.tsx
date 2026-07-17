import type { CalculationReportData } from '../../../types/calculation'

interface SummaryProps {
  report: CalculationReportData
}

function Summary({ report }: SummaryProps) {
  return (
    <div className="dashboard-summary">
      <h4>Dashboard Summary</h4>
      <p>Total Workforce: {report.district.workforce}</p>
      <p>Total Trained: {report.district.trained}</p>
      <p>Planning Gap: {report.district.gap}</p>
      <p>Batch Requirement: {report.batchRequirement}</p>
    </div>
  )
}

export default Summary
