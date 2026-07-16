import type { CalculationReportData } from '../../types/calculation'

interface CalculationReportProps {
  report: CalculationReportData
}

function CalculationReport({ report }: CalculationReportProps) {
  return (
    <section className="parser-report">
      <h3>Calculation Report</h3>
      <div className="parser-report__grid">
        <div>
          <p className="parser-report__label">Total Workforce</p>
          <p>{report.district.workforce}</p>
        </div>
        <div>
          <p className="parser-report__label">Total Trained</p>
          <p>{report.district.trained}</p>
        </div>
        <div>
          <p className="parser-report__label">Readiness</p>
          <p>{report.district.readiness.toFixed(1)}%</p>
        </div>
        <div>
          <p className="parser-report__label">Planning Gap</p>
          <p>{report.district.gap}</p>
        </div>
        <div>
          <p className="parser-report__label">Batch Requirement</p>
          <p>{report.batchRequirement}</p>
        </div>
      </div>

      <div className="parser-report__issues">
        <div>
          <h4>Blocks</h4>
          <ul>
            {report.blocks.map((block) => (
              <li key={block.block}>{block.block}: {block.gap} gap / {block.readiness.toFixed(1)}%</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Facilities</h4>
          <ul>
            {report.facilities.map((facility) => (
              <li key={`${facility.block}-${facility.facility}`}>{facility.facility}: {facility.gap} gap / {facility.readiness.toFixed(1)}%</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default CalculationReport
