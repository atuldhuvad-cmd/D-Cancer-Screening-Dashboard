import { useMemo, useState } from 'react'
import { calculateIntelligence } from './CalculationEngine'
import CalculationReport from './CalculationReport'
import type { ParsedRecord } from '../../types/parser'

const sampleRecords: ParsedRecord[] = [
  { block: 'North', facility: 'PHC A', designation: 'Medical Officer', workforce: 2, sourceRow: 2, sourceSheet: 'Sheet1' },
  { block: 'North', facility: 'PHC A', designation: 'Staff Nurse', workforce: 3, sourceRow: 2, sourceSheet: 'Sheet1' },
  { block: 'North', facility: 'PHC B', designation: 'Medical Officer', workforce: 1, sourceRow: 3, sourceSheet: 'Sheet1' },
]

function IntelligencePage() {
  const [report] = useState(() => calculateIntelligence(sampleRecords))

  const summary = useMemo(() => {
    return report.priorityBlocks.slice(0, 3).map((item) => `${item.name}: gap ${item.gap} / readiness ${item.readiness.toFixed(1)}%`)
  }, [report.priorityBlocks])

  return (
    <section className="upload-page">
      <div className="page-intro">
        <p className="eyebrow">Workforce Intelligence</p>
        <h2>District, block, facility and designation calculations</h2>
        <p>
          This module aggregates normalized staffing and training records into district intelligence and planning
          summaries using the defined readiness and gap rules.
        </p>
      </div>

      <div className="upload-page__summary">
        <div className="summary-pill">District readiness: {report.district.readiness.toFixed(1)}%</div>
        <div className="summary-pill">Batch requirement: {report.batchRequirement}</div>
      </div>

      <div className="parser-preview">
        <h3>Priority Summary</h3>
        <ul>
          {summary.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>

      <CalculationReport report={report} />
    </section>
  )
}

export default IntelligencePage
