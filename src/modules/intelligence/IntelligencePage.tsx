import '../../styles/intelligence.css'
import { useEffect, useMemo, useState } from 'react'
import { useUploadContext } from '../upload/useUploadContext'
import { extractWorkbookLike } from '../../services/excelReader'
import { buildParserReport } from '../../services/parserService'
import { calculateIntelligence } from './CalculationEngine'
import CalculationReport from './CalculationReport'
import type { CalculationReportData } from '../../types/calculation'

const formatPct = (value: number) => `${value.toFixed(1)}%`

const readinessBandClass = (value: number) => {
  if (value >= 80) return 'status-positive'
  if (value >= 60) return 'status-warning'
  return 'status-critical'
}

const topItems = <T extends { name: string; gap: number; readiness: number }>(items: T[]) =>
  items.slice(0, 3).map((item) => `${item.name}: gap ${item.gap}, readiness ${formatPct(item.readiness)}`)

function IntelligencePage() {
  const { staffingWorkbook } = useUploadContext()
  const [report, setReport] = useState<CalculationReportData>(() => calculateIntelligence([]))
  const hasUpload = Boolean(staffingWorkbook?.file)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      if (!staffingWorkbook?.file) {
        if (mounted) setReport(calculateIntelligence([]))
        return
      }

      try {
        const workbookLike = await extractWorkbookLike(staffingWorkbook.file)
        const parserReport = buildParserReport(workbookLike)
        const calc = calculateIntelligence(parserReport.records)
        if (mounted) setReport(calc)
      } catch {
        if (mounted) setReport(calculateIntelligence([]))
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [staffingWorkbook])

  const blockRanking = useMemo(() => [...report.blocks].sort((left, right) => right.readiness - left.readiness), [report.blocks])
  const facilityRanking = useMemo(() => [...report.facilities].sort((left, right) => right.readiness - left.readiness), [report.facilities])
  const designationRanking = useMemo(() => [...report.designations].sort((left, right) => right.readiness - left.readiness), [report.designations])

  const readinessDistribution = useMemo(() => {
    const counts = { strong: 0, moderate: 0, critical: 0 }
    report.blocks.forEach((block) => {
      if (block.readiness >= 80) counts.strong += 1
      else if (block.readiness >= 60) counts.moderate += 1
      else counts.critical += 1
    })
    return counts
  }, [report.blocks])

  const vacancyDistribution = useMemo(() => report.blocks.map((block) => ({ label: block.block, value: block.gap })), [report.blocks])
  const workforceDistribution = useMemo(
    () => [...report.blocks].sort((left, right) => right.workforce - left.workforce).slice(0, 5),
    [report.blocks],
  )

  const highestRiskBlocks = useMemo(
    () => [...report.blocks].sort((left, right) => left.readiness - right.readiness).slice(0, 3),
    [report.blocks],
  )

  const highestRiskFacilities = useMemo(
    () => [...report.facilities].sort((left, right) => left.readiness - right.readiness).slice(0, 3),
    [report.facilities],
  )

  const executiveInsights = useMemo(() => {
    const insights = []

    insights.push(`District readiness is ${formatPct(report.district.readiness)} across ${report.blocks.length} blocks.`)
    insights.push(`Total workforce in scope is ${report.district.workforce} with ${report.district.gap} capacity gap.`)
    insights.push(`Highest readiness is ${formatPct(blockRanking[0]?.readiness ?? 0)} in ${blockRanking[0]?.block ?? 'N/A'}.`)
    insights.push(`Critical block count is ${readinessDistribution.critical}.`)

    if (report.priorityBlocks.length > 0) {
      insights.push(`Top opportunity is ${report.priorityBlocks[0].name} with a gap of ${report.priorityBlocks[0].gap}.`)
    }

    return insights
  }, [report, blockRanking, readinessDistribution])

  if (!hasUpload) {
    return (
      <section className="intelligence-page page">
        <div className="page-intro">
          <p className="eyebrow">Advanced Intelligence</p>
          <h2>Advanced Workforce Intelligence</h2>
          <p>Please upload the staffing workbook to unlock district, block, facility and designation analytics.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="intelligence-page page">
      <div className="page-intro">
        <p className="eyebrow">Advanced Intelligence</p>
        <h2>District, block, facility and designation ranking</h2>
        <p>Advanced analytics built from the existing CalculationReportData, including rankings, distribution, heat maps, readiness insights, and critical risk detection.</p>
      </div>

      <div className="intelligence-grid">
        <div className="summary-card panel">
          <p className="summary-label">District Readiness</p>
          <p className="summary-value">{formatPct(report.district.readiness)}</p>
          <p className="summary-detail">Workforce: {report.district.workforce}</p>
          <p className="summary-detail">Gap: {report.district.gap}</p>
        </div>
        <div className="summary-card panel">
          <p className="summary-label">Top Opportunity</p>
          <p className="summary-value">{report.priorityBlocks[0]?.name ?? 'N/A'}</p>
          <p className="summary-detail">Gap: {report.priorityBlocks[0]?.gap ?? 0}</p>
        </div>
        <div className="summary-card panel">
          <p className="summary-label">Highest Risk Block</p>
          <p className="summary-value">{highestRiskBlocks[0]?.block ?? 'N/A'}</p>
          <p className="summary-detail">Readiness: {formatPct(highestRiskBlocks[0]?.readiness ?? 0)}</p>
        </div>
        <div className="summary-card panel">
          <p className="summary-label">Critical Block Count</p>
          <p className="summary-value">{readinessDistribution.critical}</p>
          <p className="summary-detail">Moderate: {readinessDistribution.moderate}</p>
        </div>
      </div>

      <div className="analytics-row">
        <div className="panel analytics-panel">
          <h3 className="section-title">Executive Insights</h3>
          <ul className="insight-list">
            {executiveInsights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </div>

        <div className="panel insight-cards">
          <div className="insight-card status-positive">
            <p>Workforce Distribution</p>
            <strong>{workforceDistribution.reduce((sum, item) => sum + item.workforce, 0)}</strong>
            <span>Top 5 blocks by workforce</span>
          </div>
          <div className="insight-card status-warning">
            <p>Vacancy Distribution</p>
            <strong>{vacancyDistribution.reduce((sum, item) => sum + item.value, 0)}</strong>
            <span>Total capacity gap across blocks</span>
          </div>
          <div className="insight-card status-critical">
            <p>Readiness Coverage</p>
            <strong>{report.blocks.length ? `${((report.blocks.filter((block) => block.readiness >= 80).length / report.blocks.length) * 100).toFixed(0)}%` : '0%'}</strong>
            <span>Blocks with strong readiness</span>
          </div>
        </div>
      </div>

      <div className="heatmap-section panel">
        <h3 className="section-title">Heat Maps</h3>
        <div className="heatmap-grid">
          {report.blocks.slice(0, 8).map((block) => (
            <div key={block.block} className={`heatmap-card ${readinessBandClass(block.readiness)}`}>
              <span>{block.block}</span>
              <strong>{formatPct(block.readiness)}</strong>
              <small>Gap {block.gap}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="rankings-panel panel">
        <div>
          <h3 className="section-title">District Ranking</h3>
          <div className="rank-row">
            <div className="rank-block">
              <p className="rank-title">Readiness</p>
              <p>{formatPct(report.district.readiness)}</p>
            </div>
            <div className="rank-block">
              <p className="rank-title">Workforce</p>
              <p>{report.district.workforce}</p>
            </div>
            <div className="rank-block">
              <p className="rank-title">Gap</p>
              <p>{report.district.gap}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="section-title">Block Ranking</h3>
          <ol className="score-list">
            {blockRanking.slice(0, 5).map((block) => (
              <li key={block.block}>{block.block}: {formatPct(block.readiness)}</li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="section-title">Facility Ranking</h3>
          <ol className="score-list">
            {facilityRanking.slice(0, 5).map((facility) => (
              <li key={`${facility.block}-${facility.facility}`}>{facility.facility} ({facility.block}): {formatPct(facility.readiness)}</li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="section-title">Designation Ranking</h3>
          <ol className="score-list">
            {designationRanking.slice(0, 5).map((designation) => (
              <li key={designation.designation}>{designation.designation}: {formatPct(designation.readiness)}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="distribution-panel panel">
        <div>
          <h3 className="section-title">Training Distribution</h3>
          <ul className="distribution-list">
            {report.designations.slice(0, 5).map((designation) => (
              <li key={designation.designation}>
                <span>{designation.designation}</span>
                <strong>{designation.workforce}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="section-title">Vacancy Distribution</h3>
          <ul className="distribution-list">
            {vacancyDistribution.slice(0, 5).map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="section-title">Readiness Distribution</h3>
          <ul className="distribution-list">
            <li>Strong: {readinessDistribution.strong}</li>
            <li>Moderate: {readinessDistribution.moderate}</li>
            <li>Critical: {readinessDistribution.critical}</li>
          </ul>
        </div>
      </div>

      <div className="critical-panel panel">
        <div>
          <h3 className="section-title">Top Opportunities</h3>
          <ol className="priority-list">
            {topItems(report.priorityBlocks).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="section-title">Highest Risk Areas</h3>
          <ol className="priority-list">
            {highestRiskBlocks.map((block) => (
              <li key={block.block}>{block.block}: {formatPct(block.readiness)} readiness</li>
            ))}
            {highestRiskFacilities.map((facility) => (
              <li key={`${facility.block}-${facility.facility}`}>{facility.facility} ({facility.block}): {formatPct(facility.readiness)} readiness</li>
            ))}
          </ol>
        </div>
      </div>

      <CalculationReport report={report} />
    </section>
  )
}

export default IntelligencePage
