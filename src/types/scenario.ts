import type { CalculationReportData } from './calculation'

export interface ScenarioModel {
  id: string
  label: string
  increaseSanctionedPosts: number
  increaseTrainedStaff: number
  addBatches: number
  improvedReadiness: number
}

export interface ScenarioAnalysis {
  baseReport: CalculationReportData
  scenarioReport: CalculationReportData
  sanctionedPostsDelta: number
  trainedStaffDelta: number
  batchDelta: number
  readinessDelta: number
  recommendations: string[]
}

export interface ScenarioState {
  scenarios: ScenarioModel[]
  selectedScenarioId: string | null
}
