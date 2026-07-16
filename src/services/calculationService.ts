import { calculateReadiness } from './readiness'
import { estimateBatches } from './batchEstimator'
import type { ParsedRecord } from '../types/parser'
import type { CalculationReportData } from '../types/calculation'

const createSummary = (workforce: number, trained: number) => ({
  workforce,
  trained,
  gap: Math.max(0, workforce - trained),
  readiness: calculateReadiness(trained, workforce),
})

export const buildCalculationReport = (records: ParsedRecord[]): CalculationReportData => {
  const districtWorkforce = records.reduce((sum, record) => sum + record.workforce, 0)
  const districtTrained = records.reduce((sum, record) => sum + record.workforce, 0)
  const districtGap = Math.max(0, districtWorkforce - districtTrained)

  const blocks = new Map<string, ParsedRecord[]>()
  const facilities = new Map<string, ParsedRecord[]>()
  const designations = new Map<string, ParsedRecord[]>()

  records.forEach((record) => {
    const blockKey = record.block
    const facilityKey = `${record.block}|${record.facility}`
    const designationKey = record.designation

    if (!blocks.has(blockKey)) {
      blocks.set(blockKey, [])
    }
    if (!facilities.has(facilityKey)) {
      facilities.set(facilityKey, [])
    }
    if (!designations.has(designationKey)) {
      designations.set(designationKey, [])
    }

    blocks.get(blockKey)?.push(record)
    facilities.get(facilityKey)?.push(record)
    designations.get(designationKey)?.push(record)
  })

  const blockSummaries = Array.from(blocks.entries()).map(([block, entries]) => {
    const workforce = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    const trained = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    return { block, ...createSummary(workforce, trained) }
  })

  const facilitySummaries = Array.from(facilities.entries()).map(([key, entries]) => {
    const [block, facility] = key.split('|')
    const workforce = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    const trained = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    return { block, facility, ...createSummary(workforce, trained) }
  })

  const designationSummaries = Array.from(designations.entries()).map(([designation, entries]) => {
    const workforce = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    const trained = entries.reduce((sum, entry) => sum + entry.workforce, 0)
    return { designation, ...createSummary(workforce, trained) }
  })

  const priorityBlocks = blockSummaries
    .map((item) => ({ name: item.block, gap: item.gap, readiness: item.readiness }))
    .sort((left, right) => right.gap - left.gap || left.readiness - right.readiness)

  const priorityFacilities = facilitySummaries
    .map((item) => ({ name: `${item.block} / ${item.facility}`, gap: item.gap, readiness: item.readiness }))
    .sort((left, right) => right.gap - left.gap || left.readiness - right.readiness)

  const priorityDesignations = designationSummaries
    .map((item) => ({ name: item.designation, gap: item.gap, readiness: item.readiness }))
    .sort((left, right) => right.gap - left.gap || left.readiness - right.readiness)

  return {
    district: {
      district: 'District',
      workforce: districtWorkforce,
      trained: districtTrained,
      gap: districtGap,
      readiness: calculateReadiness(districtTrained, districtWorkforce),
    },
    blocks: blockSummaries,
    facilities: facilitySummaries,
    designations: designationSummaries,
    priorityBlocks,
    priorityFacilities,
    priorityDesignations,
    batchRequirement: estimateBatches(districtGap),
  }
}
