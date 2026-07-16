import { useMemo, useState } from 'react'
import { buildParserReport } from '../../services/parserService'
import ParserReport from './ParserReport'

const sampleWorkbook = {
  sheets: ['Staffing'],
  rows: [
    ['Block', 'Facility', 'MO', 'SN', 'CHO'],
    ['North', 'PHC A', '2', '3', '1'],
    ['North', 'PHC B', '1', '2', '0'],
  ],
}

function ParserPage() {
  const [report] = useState(() => buildParserReport(sampleWorkbook))

  const summary = useMemo(() => {
    return report.records.slice(0, 5).map((record) => `${record.facility} · ${record.designation} · ${record.workforce}`)
  }, [report.records])

  return (
    <section className="upload-page">
      <div className="page-intro">
        <p className="eyebrow">Parser Engine</p>
        <h2>Structure-aware parsing for staffing workbooks</h2>
        <p>
          This module detects the source format, normalizes the data shape, and surfaces validation issues without
          changing the government shell or upload experience.
        </p>
      </div>

      <div className="upload-page__summary">
        <div className="summary-pill">Detected format: {report.format}</div>
        <div className="summary-pill">Records parsed: {report.records.length}</div>
      </div>

      <div className="parser-preview">
        <h3>Normalized Preview</h3>
        <ul>
          {summary.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>

      <ParserReport report={report} />
    </section>
  )
}

export default ParserPage
