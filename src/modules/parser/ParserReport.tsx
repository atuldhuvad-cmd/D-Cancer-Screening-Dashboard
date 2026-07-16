import type { ParserReportData } from '../../types/parser'

interface ParserReportProps {
  report: ParserReportData
}

function ParserReport({ report }: ParserReportProps) {
  return (
    <section className="parser-report">
      <h3>Parser Report</h3>
      <div className="parser-report__grid">
        <div>
          <p className="parser-report__label">Detected Format</p>
          <p>{report.format}</p>
        </div>
        <div>
          <p className="parser-report__label">Detected Header Row</p>
          <p>{report.headerRow + 1}</p>
        </div>
        <div>
          <p className="parser-report__label">Detected Columns</p>
          <p>{report.detectedColumns.join(', ') || 'None'}</p>
        </div>
        <div>
          <p className="parser-report__label">Designation Count</p>
          <p>{report.designationCount}</p>
        </div>
        <div>
          <p className="parser-report__label">Facility Count</p>
          <p>{report.facilityCount}</p>
        </div>
        <div>
          <p className="parser-report__label">Duplicate Count</p>
          <p>{report.duplicateCount}</p>
        </div>
      </div>

      <div className="parser-report__issues">
        <div>
          <h4>Warnings</h4>
          <ul>
            {report.warnings.map((warning, index) => (
              <li key={`${warning.message}-${index}`}>{warning.message}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Errors</h4>
          <ul>
            {report.errors.map((error, index) => (
              <li key={`${error.message}-${index}`}>{error.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default ParserReport
