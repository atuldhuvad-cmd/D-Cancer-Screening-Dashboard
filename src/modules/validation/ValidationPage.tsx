import '../../styles/validation.css'
import { useEffect, useMemo, useState } from 'react'
import { useUploadContext } from '../upload/useUploadContext'
import { validateStaffingWorkbook } from '../../services/validation/validationService'
import { exportValidationReportToExcel } from '../../services/validation/validationExcelExport'
import { exportValidationReportToPdf } from '../../services/validation/validationPdfExport'
import type { ValidationReport } from '../../types/validation'

const severityLabel = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
}

const severityClass = {
  error: 'status-error',
  warning: 'status-warning',
  info: 'status-info',
}

const filterOptions = ['all', 'error', 'warning', 'info'] as const

type FilterOption = typeof filterOptions[number]

function ValidationPage() {
  const { staffingWorkbook } = useUploadContext()
  const [report, setReport] = useState<ValidationReport | null>(null)
  const [filter, setFilter] = useState<FilterOption>('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    document.title = 'WTIP | Validation Centre'
  }, [])

  useEffect(() => {
    const workbookFile = staffingWorkbook?.file
    if (!staffingWorkbook || !workbookFile) {
      setReport(null)
      return
    }

    let mounted = true
    const run = async () => {
      const validationReport = await validateStaffingWorkbook(workbookFile)
      if (mounted) setReport(validationReport)
    }
    void run()
    return () => { mounted = false }
  }, [staffingWorkbook])

  const filteredIssues = useMemo(() => {
    if (!report) return []
    return report.issues.filter((issue) => {
      const matchesFilter = filter === 'all' ? true : issue.severity === filter
      const search = searchText.trim().toLowerCase()
      const matchesSearch = search
        ? issue.category.toLowerCase().includes(search)
          || issue.field.toLowerCase().includes(search)
          || issue.message.toLowerCase().includes(search)
          || (issue.row !== null && String(issue.row).includes(search))
        : true
      return matchesFilter && matchesSearch
    })
  }, [filter, report, searchText])

  if (!staffingWorkbook) {
    return (
      <section className="validation-page">
        <div className="page-intro">
          <p className="eyebrow">Validation Centre</p>
          <h2>Data Quality & Validation Centre</h2>
          <p>Please upload the staffing workbook to inspect validation issues.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="validation-page page">
      <div className="page-intro">
        <p className="eyebrow">Validation Centre</p>
        <h2>Data Quality & Validation Centre</h2>
        <p>Inspect upload data for missing fields, invalid values, duplicates, and reporting issues.</p>
      </div>

      <div className="validation-summary">
        <div className="summary-card">
          <p className="summary-title">Total Issues</p>
          <p className="summary-value">{report?.summary.total ?? 0}</p>
        </div>
        <div className="summary-card status-error">
          <p className="summary-title">Errors</p>
          <p className="summary-value">{report?.summary.errors ?? 0}</p>
        </div>
        <div className="summary-card status-warning">
          <p className="summary-title">Warnings</p>
          <p className="summary-value">{report?.summary.warnings ?? 0}</p>
        </div>
        <div className="summary-card status-info">
          <p className="summary-title">Info</p>
          <p className="summary-value">{report?.summary.info ?? 0}</p>
        </div>
      </div>

      <div className="validation-controls">
        <div className="filter-group">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-button ${filter === option ? 'active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option === 'all' ? 'All' : severityLabel[option]}
            </button>
          ))}
        </div>

        <div className="search-export-row">
          <input
            type="search"
            placeholder="Search issues..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <div className="export-actions">
            <button className="upload-button" onClick={() => report && exportValidationReportToExcel(report)}>Export Excel</button>
            <button className="upload-button" onClick={() => report && exportValidationReportToPdf(report)}>Export PDF</button>
          </div>
        </div>
      </div>

      <div className="validation-table-wrapper">
        <table className="validation-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Category</th>
              <th>Field</th>
              <th>Row</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">No issues found.</td>
              </tr>
            ) : filteredIssues.map((issue) => (
              <tr key={`${issue.id}-${issue.row ?? 'na'}`}>
                <td className={severityClass[issue.severity]}>{severityLabel[issue.severity]}</td>
                <td>{issue.category}</td>
                <td>{issue.field}</td>
                <td>{issue.row ?? 'N/A'}</td>
                <td>{issue.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ValidationPage
