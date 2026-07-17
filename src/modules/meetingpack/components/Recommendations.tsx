// No React import required with new JSX transform
import type { CalculationReportData } from '../../../types/calculation'

const Recommendations = ({ report }: { report: CalculationReportData | null }) => {
  if (!report) return <div>No data available</div>

  const recs: string[] = []
  if (report.priorityBlocks.length) recs.push(`Focus immediate training resources on ${report.priorityBlocks.slice(0,3).map((b) => b.name).join(', ')}.`)
  if (report.priorityFacilities.length) recs.push(`Allocate batch planning for facilities: ${report.priorityFacilities.slice(0,3).map((f) => f.name).join(', ')}.`)
  if (report.batchRequirement > 0) recs.push(`Plan for approximately ${report.batchRequirement} training batches to cover identified gaps.`)
  if (recs.length === 0) recs.push('No immediate actions required; readiness levels are acceptable.')

  return (
    <ol className="recommendations-list">
      {recs.map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ol>
  )
}

export default Recommendations
