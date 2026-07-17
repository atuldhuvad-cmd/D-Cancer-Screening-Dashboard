import { useEffect, useState } from 'react'
import { useUploadContext } from '../../modules/upload/useUploadContext'
import { extractWorkbookLike } from '../../services/excelReader'
import { buildParserReport } from '../../services/parserService'
import { calculateIntelligence } from '../intelligence/CalculationEngine'
import MeetingHeader from './components/MeetingHeader'
import SummaryTable from './components/SummaryTable'
import PriorityList from './components/PriorityList'
import BatchSummary from './components/BatchSummary'
import Recommendations from './components/Recommendations'
import type { CalculationReportData } from '../../types/calculation'
import { exportReportToExcel } from '../../services/excel/excelExport'

function MeetingPackPage() {
  const { staffingWorkbook } = useUploadContext()
  const [report, setReport] = useState<CalculationReportData | null>(null)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      if (!staffingWorkbook || !staffingWorkbook.file) {
        if (mounted) setReport(null)
        return
      }

      try {
        const workbookLike = await extractWorkbookLike(staffingWorkbook.file)
        const parserReport = buildParserReport(workbookLike)
        const calc = calculateIntelligence(parserReport.records)
        if (mounted) setReport(calc)
      } catch {
        if (mounted) setReport(null)
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [staffingWorkbook])

  return (
    <section className="meeting-pack page">
      <div className="page-intro">
        <p className="eyebrow">Meeting Pack</p>
        <h2>District Meeting Pack</h2>
        <p>Print-ready meeting pack derived from uploaded staffing data and calculation engine.</p>
      </div>

      <MeetingHeader report={report} />

      <div className="meeting-section">
        <h3 className="section-title">Executive Summary</h3>
        <SummaryTable report={report} scope="district" />
      </div>

      <div className="meeting-section">
        <h3 className="section-title">District Workforce Summary</h3>
        <SummaryTable report={report} scope="district" />
      </div>

      <div className="meeting-section">
        <h3 className="section-title">Block-wise Summary</h3>
        <SummaryTable report={report} scope="block" />
      </div>

      <div className="meeting-section">
        <h3 className="section-title">Facility-wise Summary</h3>
        <SummaryTable report={report} scope="facility" />
      </div>

      <div className="meeting-section">
        <h3 className="section-title">Designation-wise Summary</h3>
        <SummaryTable report={report} scope="designation" />
      </div>

      <div className="meeting-section">
        <h3 className="section-title">Training Gap Summary</h3>
        <SummaryTable report={report} scope="designation" />
      </div>

      <div className="meeting-section two-column">
        <div>
          <h3 className="section-title">Priority Blocks</h3>
          <PriorityList items={report?.priorityBlocks ?? []} />

          <h3 className="section-title">Priority Facilities</h3>
          <PriorityList items={report?.priorityFacilities ?? []} />
        </div>

        <div>
          <h3 className="section-title">Critical Designations</h3>
          <PriorityList items={report?.priorityDesignations ?? []} />

          <h3 className="section-title">Batch Planning Summary</h3>
          <BatchSummary batchRequirement={report?.batchRequirement ?? 0} />
        </div>
      </div>

      <div className="meeting-section">
        <h3 className="section-title">Key Recommendations</h3>
        <Recommendations report={report} />
      </div>

      <div className="meeting-print-actions">
        <button className="upload-button" onClick={() => window.print()}>Print Meeting Pack</button>
        <button className="upload-button" onClick={() => report && exportReportToExcel(report)}>Export Excel</button>
      </div>
    </section>
  )
}

export default MeetingPackPage
