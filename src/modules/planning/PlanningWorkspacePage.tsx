import '../../styles/planning.css'
import { useEffect, useMemo, useState } from 'react'
import { useUploadContext } from '../upload/useUploadContext'
import { extractWorkbookLike } from '../../services/excelReader'
import { buildParserReport } from '../../services/parserService'
import { calculateIntelligence } from '../intelligence/CalculationEngine'
import { applyScenarioToReport, compareScenario, buildScenarioRecommendations } from '../../services/scenarioService'
import type { CalculationReportData } from '../../types/calculation'
import type { ScenarioModel } from '../../types/scenario'

const defaultScenario: ScenarioModel = {
  id: 'scenario-1',
  label: 'Scenario 1',
  increaseSanctionedPosts: 0,
  increaseTrainedStaff: 0,
  addBatches: 0,
  improvedReadiness: 0,
}

const formatPct = (value: number) => `${value.toFixed(1)}%`

function PlanningWorkspacePage() {
  const { staffingWorkbook } = useUploadContext()
  const [baseReport, setBaseReport] = useState<CalculationReportData>(() => calculateIntelligence([]))
  const [scenario, setScenario] = useState<ScenarioModel>(defaultScenario)
  const [scenarioReport, setScenarioReport] = useState<CalculationReportData>(() => calculateIntelligence([]))

  useEffect(() => {
    let mounted = true

    const run = async () => {
      if (!staffingWorkbook?.file) {
        if (mounted) {
          setBaseReport(calculateIntelligence([]))
          setScenarioReport(calculateIntelligence([]))
        }
        return
      }

      try {
        const workbookLike = await extractWorkbookLike(staffingWorkbook.file)
        const parserReport = buildParserReport(workbookLike)
        const calc = calculateIntelligence(parserReport.records)
        if (mounted) {
          setBaseReport(calc)
          setScenarioReport(applyScenarioToReport(calc, scenario))
        }
      } catch {
        if (mounted) {
          setBaseReport(calculateIntelligence([]))
          setScenarioReport(calculateIntelligence([]))
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [staffingWorkbook])

  useEffect(() => {
    setScenarioReport(applyScenarioToReport(baseReport, scenario))
  }, [baseReport, scenario])

  const comparison = useMemo(() => compareScenario(baseReport, scenarioReport), [baseReport, scenarioReport])
  const recommendations = useMemo(() => buildScenarioRecommendations(comparison), [comparison])

  const updateScenario = (field: keyof Omit<ScenarioModel, 'id' | 'label'>, value: number) => {
    setScenario((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="planning-workspace page">
      <div className="page-intro">
        <p className="eyebrow">Scenario Planning</p>
        <h2>Scenario Dashboard</h2>
        <p>Build planning scenarios safely without changing uploaded staffing data. Compare current state with scenario impact, including sanctioned posts, training, batches, and readiness.</p>
      </div>

      <div className="scenario-grid">
        <div className="panel scenario-form">
          <h3>Scenario Inputs</h3>
          <label>
            Increase sanctioned posts
            <input
              type="number"
              value={scenario.increaseSanctionedPosts}
              onChange={(event) => updateScenario('increaseSanctionedPosts', Number(event.target.value))}
            />
          </label>
          <label>
            Increase trained staff
            <input
              type="number"
              value={scenario.increaseTrainedStaff}
              onChange={(event) => updateScenario('increaseTrainedStaff', Number(event.target.value))}
            />
          </label>
          <label>
            Add new batches
            <input
              type="number"
              value={scenario.addBatches}
              onChange={(event) => updateScenario('addBatches', Number(event.target.value))}
            />
          </label>
          <label>
            Improve readiness (points)
            <input
              type="number"
              value={scenario.improvedReadiness}
              onChange={(event) => updateScenario('improvedReadiness', Number(event.target.value))}
            />
          </label>
        </div>

        <div className="panel scenario-summary">
          <h3>Current vs Scenario</h3>
          <div className="comparison-row">
            <div>
              <p>Current Readiness</p>
              <strong>{formatPct(baseReport.district.readiness)}</strong>
            </div>
            <div>
              <p>Scenario Readiness</p>
              <strong>{formatPct(scenarioReport.district.readiness)}</strong>
            </div>
          </div>

          <div className="comparison-row">
            <div>
              <p>Current Gap</p>
              <strong>{baseReport.district.gap}</strong>
            </div>
            <div>
              <p>Scenario Gap</p>
              <strong>{scenarioReport.district.gap}</strong>
            </div>
          </div>

          <div className="comparison-row">
            <div>
              <p>Current Batch Need</p>
              <strong>{baseReport.batchRequirement}</strong>
            </div>
            <div>
              <p>Scenario Batch Need</p>
              <strong>{scenarioReport.batchRequirement}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="scenario-charts panel">
        <h3>Impact Analysis</h3>
        <div className="impact-row">
          <div>
            <p>Workforce Delta</p>
            <strong>{comparison.workforceDelta}</strong>
          </div>
          <div>
            <p>Trained Staff Delta</p>
            <strong>{comparison.trainedDelta}</strong>
          </div>
          <div>
            <p>Gap Delta</p>
            <strong>{comparison.gapDelta}</strong>
          </div>
          <div>
            <p>Readiness Delta</p>
            <strong>{comparison.readinessDelta.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      <div className="scenario-charts panel">
        <h3>Rankings Comparison</h3>
        <div className="ranking-block">
          <p>Top priority block now</p>
          <strong>{scenarioReport.priorityBlocks[0]?.name ?? 'N/A'}</strong>
        </div>
        <div className="ranking-block">
          <p>Top priority facility now</p>
          <strong>{scenarioReport.priorityFacilities[0]?.name ?? 'N/A'}</strong>
        </div>
        <div className="ranking-block">
          <p>Top critical designation now</p>
          <strong>{scenarioReport.priorityDesignations[0]?.name ?? 'N/A'}</strong>
        </div>
      </div>

      <div className="scenario-charts panel">
        <h3>Planning Recommendations</h3>
        <ul className="recommendation-list">
          {recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default PlanningWorkspacePage
