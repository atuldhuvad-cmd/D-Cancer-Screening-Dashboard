import { useMemo } from 'react'
import { calculateIntelligence } from '../intelligence/CalculationEngine'
import CalculationReport from '../intelligence/CalculationReport'
import { useUploadContext } from '../../modules/upload/useUploadContext'
import { exportReportToExcel } from '../../services/excel/excelExport'
import { exportReportToPdf } from '../../services/pdf/pdfExport'
import KpiCard from './components/KpiCard'
import Gauge from './components/Gauge'
import PriorityTable from './components/PriorityTable'
import SmallBarChart from './components/SmallBarChart'
import Summary from './components/Summary'
// ParsedRecord import not required directly in this module

function formatPct(actual: number, workforce: number): string {
  const pct = (actual / (workforce || 1)) * 100
  const display = pct > 100 ? `${Math.min(pct, 100).toFixed(1)}%*` : `${pct.toFixed(1)}%`
  return display
}

function ExecutivePage() {
  const { report: workspaceReport } = useUploadContext()
  const report = useMemo(() => workspaceReport ?? calculateIntelligence([]), [workspaceReport])

  const kpis = useMemo(() => {
    return {
      workforce: report.district.workforce,
      trained: report.district.trained,
      readiness: report.district.readiness,
      gap: report.district.gap,
      batches: report.batchRequirement,
    }
  }, [report])

  return (
    <section className="executive-page">
      <div className="page-intro">
        <p className="eyebrow">Executive Dashboard</p>
        <h2>District Intelligence summary</h2>
        <p>Key planning metrics, priority lists, and summaries for district decision makers.</p>
      </div>

      <div className="kpi-grid">
        <KpiCard title="Total Workforce" value={String(kpis.workforce)} />
        <KpiCard title="Total Trained" value={String(kpis.trained)} />
        <KpiCard title="District Readiness" value={formatPct(report.district.trained, report.district.workforce)} subValue={`${report.district.readiness.toFixed(1)}%`} />
        <KpiCard title="Planning Gap" value={String(kpis.gap)} />
        <KpiCard title="Batch Requirement" value={String(kpis.batches)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="upload-button" onClick={() => exportReportToExcel(report)}>Export Excel</button>
          <button className="upload-button" onClick={() => exportReportToPdf(report)}>Export PDF</button>
        </div>
      </div>

      <div className="executive-grid">
        <div className="executive-left">
          <Gauge value={report.district.readiness} />

          <div className="charts">
            <SmallBarChart title="Block Readiness" items={report.blocks.map((b) => ({ name: b.block, value: b.readiness }))} />
            <SmallBarChart title="Block Gap" items={report.blocks.map((b) => ({ name: b.block, value: b.gap }))} maxValue={Math.max(...report.blocks.map((b) => b.gap), 1)} />
          </div>

          <CalculationReport report={report} />
        </div>

        <div className="executive-right">
          <Summary report={report} />

          <PriorityTable title="Priority Blocks" items={report.priorityBlocks} />
          <PriorityTable title="Priority Facilities" items={report.priorityFacilities} />
          <PriorityTable title="Critical Designations" items={report.priorityDesignations} />
        </div>
      </div>
    </section>
  )
}

export default ExecutivePage
