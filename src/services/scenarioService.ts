import { calculateReadiness } from './readiness'
import { estimateBatches } from './batchEstimator'
import type { CalculationReportData } from '../types/calculation'
import type { ScenarioModel } from '../types/scenario'

export const applyScenarioToReport = (baseReport: CalculationReportData, scenario: ScenarioModel): CalculationReportData => {
  const scaledDistrict = {
    district: baseReport.district.district,
    workforce: baseReport.district.workforce + scenario.increaseSanctionedPosts,
    trained: baseReport.district.trained + scenario.increaseTrainedStaff,
    gap: Math.max(0, baseReport.district.gap - scenario.addBatches * 30 - scenario.increaseTrainedStaff),
    readiness: calculateReadiness(baseReport.district.trained + scenario.increaseTrainedStaff + scenario.improvedReadiness, baseReport.district.workforce + scenario.increaseSanctionedPosts),
  }

  const scenariosForSummary = baseReport.blocks.map((block) => ({
    ...block,
    workforce: block.workforce + Math.round((block.workforce / baseReport.district.workforce) * scenario.increaseSanctionedPosts || 0),
    trained: block.trained + Math.round((block.trained / baseReport.district.trained) * scenario.increaseTrainedStaff || 0),
  }))

  const scenarioBlocks = scenariosForSummary.map((block) => ({
    ...block,
    gap: Math.max(0, block.workforce - block.trained - Math.round((block.workforce / baseReport.district.workforce) * scenario.addBatches * 30 || 0)),
    readiness: calculateReadiness(block.trained + Math.round((block.trained / baseReport.district.trained) * scenario.improvedReadiness || 0), block.workforce),
  }))

  const scenarioFacilities = baseReport.facilities.map((facility) => ({
    ...facility,
    workforce: facility.workforce + Math.round((facility.workforce / baseReport.district.workforce) * scenario.increaseSanctionedPosts || 0),
    trained: facility.trained + Math.round((facility.trained / baseReport.district.trained) * scenario.increaseTrainedStaff || 0),
    gap: Math.max(0, facility.workforce - facility.trained),
    readiness: calculateReadiness(
      facility.trained + Math.round((facility.trained / baseReport.district.trained) * scenario.improvedReadiness || 0),
      facility.workforce + Math.round((facility.workforce / baseReport.district.workforce) * scenario.increaseSanctionedPosts || 0),
    ),
  }))

  const scenarioDesignations = baseReport.designations.map((designation) => ({
    ...designation,
    workforce: designation.workforce + Math.round((designation.workforce / baseReport.district.workforce) * scenario.increaseSanctionedPosts || 0),
    trained: designation.trained + Math.round((designation.trained / baseReport.district.trained) * scenario.increaseTrainedStaff || 0),
    gap: Math.max(0, designation.workforce - designation.trained),
    readiness: calculateReadiness(
      designation.trained + Math.round((designation.trained / baseReport.district.trained) * scenario.improvedReadiness || 0),
      designation.workforce + Math.round((designation.workforce / baseReport.district.workforce) * scenario.increaseSanctionedPosts || 0),
    ),
  }))

  const priorityBlocks = scenarioBlocks
    .map((item) => ({ name: item.block, gap: item.gap, readiness: item.readiness }))
    .sort((left, right) => right.gap - left.gap || left.readiness - right.readiness)

  const priorityFacilities = scenarioFacilities
    .map((item) => ({ name: `${item.block} / ${item.facility}`, gap: item.gap, readiness: item.readiness }))
    .sort((left, right) => right.gap - left.gap || left.readiness - right.readiness)

  const priorityDesignations = scenarioDesignations
    .map((item) => ({ name: item.designation, gap: item.gap, readiness: item.readiness }))
    .sort((left, right) => right.gap - left.gap || left.readiness - right.readiness)

  return {
    district: scaledDistrict,
    blocks: scenarioBlocks,
    facilities: scenarioFacilities,
    designations: scenarioDesignations,
    priorityBlocks,
    priorityFacilities,
    priorityDesignations,
    batchRequirement: estimateBatches(scaledDistrict.gap),
  }
}

export const compareScenario = (baseReport: CalculationReportData, scenarioReport: CalculationReportData) => {
  return {
    workforceDelta: scenarioReport.district.workforce - baseReport.district.workforce,
    trainedDelta: scenarioReport.district.trained - baseReport.district.trained,
    gapDelta: scenarioReport.district.gap - baseReport.district.gap,
    readinessDelta: scenarioReport.district.readiness - baseReport.district.readiness,
    batchDelta: scenarioReport.batchRequirement - baseReport.batchRequirement,
  }
}

export const buildScenarioRecommendations = (analysis: ReturnType<typeof compareScenario>) => {
  const recommendations: string[] = []

  if (analysis.workforceDelta > 0) {
    recommendations.push(`Increase sanctioned posts by ${analysis.workforceDelta} to improve coverage.`)
  }
  if (analysis.trainedDelta > 0) {
    recommendations.push(`Add ${analysis.trainedDelta} trained staff to close readiness gaps.`)
  }
  if (analysis.gapDelta < 0) {
    recommendations.push(`Reduce planning gap by ${Math.abs(analysis.gapDelta)} through targeted batch planning.`)
  }
  if (analysis.readinessDelta > 0) {
    recommendations.push(`Scenario readiness improves by ${analysis.readinessDelta.toFixed(1)} percentage points.`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Current scenario produces no measurable improvement. Review scenario assumptions.')
  }

  return recommendations
}
