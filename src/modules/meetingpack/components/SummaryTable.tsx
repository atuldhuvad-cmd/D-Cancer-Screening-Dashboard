import type { CalculationReportData, BlockSummary, FacilitySummary, DesignationSummary } from '../../../types/calculation'

type Props = {
  report: CalculationReportData | null
  scope: 'district' | 'block' | 'facility' | 'designation'
}

const formatPct = (actual: number, workforce: number) => {
  const pct = (actual / (workforce || 1)) * 100
  return pct > 100 ? `${Math.min(pct, 100).toFixed(1)}%*` : `${pct.toFixed(1)}%`
}

const SummaryTable = ({ report, scope }: Props) => {
  if (!report) return <div className="small-chart__empty">No data available</div>

  if (scope === 'district') {
    return (
      <table className="summary-table">
        <thead>
          <tr>
            <th>Scope</th>
            <th>Workforce</th>
            <th>Trained</th>
            <th>Readiness</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>District</td>
            <td>{report.district.workforce}</td>
            <td>{report.district.trained}</td>
            <td>{formatPct(report.district.trained, report.district.workforce)}</td>
            <td>{report.district.gap}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  const rows: BlockSummary[] | FacilitySummary[] | DesignationSummary[] = scope === 'block'
    ? report.blocks
    : scope === 'facility'
      ? report.facilities
      : report.designations

  return (
    <table className="summary-table">
      <thead>
        <tr>
          <th>{scope === 'facility' ? 'Block / Facility' : scope === 'designation' ? 'Designation' : 'Block'}</th>
          <th>Workforce</th>
          <th>Trained</th>
          <th>Readiness</th>
          <th>Gap</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={`${scope}-${idx}`}>
            <td>{'facility' in r ? `${(r as FacilitySummary).block} / ${(r as FacilitySummary).facility}` : 'designation' in r ? (r as DesignationSummary).designation : (r as BlockSummary).block}</td>
            <td>{r.workforce}</td>
            <td>{r.trained}</td>
            <td>{formatPct(r.trained, r.workforce)}</td>
            <td>{r.gap}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default SummaryTable
