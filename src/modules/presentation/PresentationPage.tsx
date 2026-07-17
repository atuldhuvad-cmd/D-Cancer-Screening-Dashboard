import '../../styles/presentation.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useUploadContext } from '../upload/useUploadContext'
import { extractWorkbookLike } from '../../services/excelReader'
import { buildParserReport } from '../../services/parserService'
import { calculateIntelligence } from '../intelligence/CalculationEngine'
import KpiCard from '../executive/components/KpiCard'
import Gauge from '../executive/components/Gauge'
import PriorityTable from '../executive/components/PriorityTable'
import Summary from '../executive/components/Summary'
import Recommendations from '../meetingpack/components/Recommendations'
import SmallBarChart from '../executive/components/SmallBarChart'
import type { CalculationReportData } from '../../types/calculation'

const formatPct = (value: number) => `${value.toFixed(1)}%`

const slideTitles = [
  'Executive KPIs',
  'District Summary',
  'Block Summary',
  'Facility Summary',
  'Recommendations',
]

function PresentationPage() {
  const { staffingWorkbook } = useUploadContext()
  const [report, setReport] = useState<CalculationReportData>(() => calculateIntelligence([]))
  const [slideIndex, setSlideIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadReport = async () => {
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

    void loadReport()
    return () => { mounted = false }
  }, [staffingWorkbook])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setSlideIndex((current) => (current + 1) % slideTitles.length)
      }
      if (event.key === 'ArrowLeft') {
        setSlideIndex((current) => (current - 1 + slideTitles.length) % slideTitles.length)
      }
      if (event.key.toLowerCase() === 'f') {
        toggleFullScreen()
      }
      if (event.key.toLowerCase() === 'a') {
        setIsAutoPlay((current) => !current)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!isAutoPlay) return undefined

    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slideTitles.length)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [isAutoPlay])

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', onFullScreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange)
  }, [])

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined)
    } else {
      document.exitFullscreen().catch(() => undefined)
    }
  }, [])

  const nextSlide = useCallback(() => {
    setSlideIndex((current) => (current + 1) % slideTitles.length)
  }, [])

  const previousSlide = useCallback(() => {
    setSlideIndex((current) => (current - 1 + slideTitles.length) % slideTitles.length)
  }, [])

  const slideContent = useMemo(() => {
    switch (slideIndex) {
      case 0:
        return (
          <div className="slide-pane slide-pane--kpis">
            <div className="kpi-row">
              <KpiCard title="Total Workforce" value={String(report.district.workforce)} />
              <KpiCard title="Total Trained" value={String(report.district.trained)} />
              <KpiCard title="Readiness" value={formatPct(report.district.readiness)} subValue={`${report.district.readiness.toFixed(1)}%`} />
              <KpiCard title="Planning Gap" value={String(report.district.gap)} />
            </div>
            <div className="summary-chart-row">
              <Gauge value={report.district.readiness} />
              <Summary report={report} />
            </div>
          </div>
        )
      case 1:
        return (
          <div className="slide-pane">
            <div className="slide-section">
              <h3>District Summary</h3>
              <div className="summary-detail-grid">
                <div>
                  <p>District Workforce</p>
                  <strong>{report.district.workforce}</strong>
                </div>
                <div>
                  <p>District Trained</p>
                  <strong>{report.district.trained}</strong>
                </div>
                <div>
                  <p>District Readiness</p>
                  <strong>{formatPct(report.district.readiness)}</strong>
                </div>
                <div>
                  <p>District Gap</p>
                  <strong>{report.district.gap}</strong>
                </div>
              </div>
            </div>
            <SmallBarChart title="Block Readiness" items={report.blocks.map((item) => ({ name: item.block, value: item.readiness }))} />
          </div>
        )
      case 2:
        return (
          <div className="slide-pane">
            <h3>Block Summary</h3>
            <PriorityTable title="Top Block Priorities" items={report.priorityBlocks.slice(0, 6)} />
            <SmallBarChart title="Block Gap" items={report.blocks.map((item) => ({ name: item.block, value: item.gap }))} maxValue={Math.max(...report.blocks.map((item) => item.gap), 1)} />
          </div>
        )
      case 3:
        return (
          <div className="slide-pane">
            <h3>Facility Summary</h3>
            <PriorityTable title="Top Facility Priorities" items={report.priorityFacilities.slice(0, 6)} />
            <SmallBarChart title="Facility Readiness" items={report.facilities.slice(0, 6).map((item) => ({ name: item.facility, value: item.readiness }))} />
          </div>
        )
      case 4:
      default:
        return (
          <div className="slide-pane">
            <h3>Recommendations</h3>
            <Recommendations report={report} />
            <div className="mini-summary">
              <div>
                <p>Highest Risk Block</p>
                <strong>{report.priorityBlocks[0]?.name ?? 'N/A'}</strong>
              </div>
              <div>
                <p>Top Opportunity</p>
                <strong>{report.priorityBlocks[0]?.name ?? 'N/A'}</strong>
              </div>
            </div>
          </div>
        )
    }
  }, [report, slideIndex])

  return (
    <section className="presentation-page page">
      <div className="presentation-header">
        <div>
          <p className="eyebrow">Presentation Mode</p>
          <h2>{slideTitles[slideIndex]}</h2>
          <p>Use arrow keys or the buttons to navigate. Press F for fullscreen and A to toggle autoplay.</p>
        </div>
        <div className="presentation-controls">
          <button type="button" onClick={previousSlide}>Previous</button>
          <button type="button" onClick={nextSlide}>Next</button>
          <button type="button" onClick={toggleFullScreen}>{isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
          <button type="button" onClick={() => setIsAutoPlay((current) => !current)}>{isAutoPlay ? 'Stop Auto' : 'Auto Play'}</button>
        </div>
      </div>

      {staffingWorkbook?.file ? (
        <div className="presentation-slide">{slideContent}</div>
      ) : (
        <div className="presentation-empty">
          <p>No staffing upload detected. Please upload data to launch Presentation Mode.</p>
        </div>
      )}

      <div className="presentation-footer">
        <span>Slide {slideIndex + 1} of {slideTitles.length}</span>
        <span>Controls: ← / → / F / A</span>
      </div>
    </section>
  )
}

export default PresentationPage
