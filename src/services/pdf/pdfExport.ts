import type { jsPDF } from 'jspdf'
import { addCoverPage, addParagraph, addSectionHeading, createPdfDocument, drawFooter, drawHeader } from './pdfDocument'
import { addPriorityTable, addRecommendationList, addSummaryTable } from './pdfTableRenderer'
import { formatDateTime, formatNumber, formatReadinessDisplay } from './pdfTheme'
import type { CalculationReportData, PriorityItem } from '../../types/calculation'

const buildSummaryRows = (report: CalculationReportData, scope: 'district' | 'block' | 'facility' | 'designation') => {
  switch (scope) {
    case 'district':
      return [[
        'District',
        report.district.workforce,
        report.district.trained,
        formatReadinessDisplay(report.district.readiness),
        report.district.gap,
      ]]
    case 'block':
      return report.blocks.map((block) => [
        block.block,
        block.workforce,
        block.trained,
        formatReadinessDisplay(block.readiness),
        block.gap,
      ])
    case 'facility':
      return report.facilities.map((facility) => [
        `${facility.block} / ${facility.facility}`,
        facility.workforce,
        facility.trained,
        formatReadinessDisplay(facility.readiness),
        facility.gap,
      ])
    case 'designation':
      return report.designations.map((designation) => [
        designation.designation,
        designation.workforce,
        designation.trained,
        formatReadinessDisplay(designation.readiness),
        designation.gap,
      ])
    default:
      return []
  }
}

const createPriorityRows = (items: PriorityItem[]) => items.map((item) => [item.name, item.gap, formatReadinessDisplay(item.readiness)])

const buildRecommendationItems = (report: CalculationReportData) => {
  const recs: string[] = []
  if (report.priorityBlocks.length) recs.push(`Focus immediate training resources on ${report.priorityBlocks.slice(0, 3).map((item) => item.name).join(', ')}.`)
  if (report.priorityFacilities.length) recs.push(`Allocate batch planning for facilities: ${report.priorityFacilities.slice(0, 3).map((item) => item.name).join(', ')}.`)
  if (report.batchRequirement > 0) recs.push(`Plan for approximately ${report.batchRequirement} training batches to cover identified gaps.`)
  if (!recs.length) recs.push('Maintain current training deployment. No immediate actions required.')
  return recs
}

const appendPageHeaderFooter = (doc: jsPDF, title: string) => {
  const generatedAt = formatDateTime(new Date())
  const pageCount = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber)
    drawHeader(doc, title)
    drawFooter(doc, pageNumber, pageCount, generatedAt)
  }
}

export const exportReportToPdf = async (report: CalculationReportData, filename = 'wtip-meeting-pack.pdf') => {
  const doc = createPdfDocument()
  addCoverPage(doc, report)

  const reportTitle = 'WTIP Meeting Pack'
  doc.addPage('a4', 'portrait')
  let currentY = 28

  currentY = addSectionHeading(doc, 'Executive Summary', currentY)
  currentY = addParagraph(doc, `This report is generated from the live Workforce Intelligence data uploaded into WTIP v2.0. It reflects calculations for district readiness, training gaps, priority locations, and batch planning recommendations.`, currentY)

  currentY = addSectionHeading(doc, 'District Workforce Summary', currentY + 6)
  currentY = addSummaryTable(doc, ['Scope', 'Workforce', 'Trained', 'Readiness', 'Gap'], buildSummaryRows(report, 'district'), currentY + 4) + 10

  currentY = addSectionHeading(doc, 'Block Summary', currentY)
  currentY = addSummaryTable(doc, ['Block', 'Workforce', 'Trained', 'Readiness', 'Gap'], buildSummaryRows(report, 'block'), currentY + 4) + 10

  doc.addPage('a4', 'landscape')
  currentY = 28
  currentY = addSectionHeading(doc, 'Facility Summary', currentY)
  currentY = addSummaryTable(doc, ['Block / Facility', 'Workforce', 'Trained', 'Readiness', 'Gap'], buildSummaryRows(report, 'facility'), currentY + 4) + 10

  doc.addPage('a4', 'portrait')
  currentY = 28
  currentY = addSectionHeading(doc, 'Designation Summary', currentY)
  currentY = addSummaryTable(doc, ['Designation', 'Workforce', 'Trained', 'Readiness', 'Gap'], buildSummaryRows(report, 'designation'), currentY + 4) + 10

  currentY = addSectionHeading(doc, 'Training Gap Summary', currentY)
  currentY = addSummaryTable(doc, ['Designation', 'Workforce', 'Trained', 'Readiness', 'Gap'], buildSummaryRows(report, 'designation'), currentY + 4) + 10

  currentY = addSectionHeading(doc, 'Priority Blocks', currentY)
  currentY = addPriorityTable(doc, ['Block', 'Gap', 'Readiness'], createPriorityRows(report.priorityBlocks), currentY + 4) + 10

  currentY = addSectionHeading(doc, 'Priority Facilities', currentY)
  currentY = addPriorityTable(doc, ['Facility', 'Gap', 'Readiness'], createPriorityRows(report.priorityFacilities), currentY + 4) + 10

  currentY = addSectionHeading(doc, 'Critical Designations', currentY)
  currentY = addPriorityTable(doc, ['Designation', 'Gap', 'Readiness'], createPriorityRows(report.priorityDesignations), currentY + 4) + 10

  currentY = addSectionHeading(doc, 'Batch Planning Summary', currentY)
  currentY = addParagraph(doc, `The current data indicates a requirement for ${formatNumber(report.batchRequirement)} training batches to address the gap across the district. Batch planning should be prioritized for the locations and cadres identified in this report.`, currentY + 4)

  currentY = addSectionHeading(doc, 'Key Recommendations', currentY + 10)
  currentY = addRecommendationList(doc, buildRecommendationItems(report), currentY + 4)

  appendPageHeaderFooter(doc, reportTitle)
  doc.save(filename)
}

export default exportReportToPdf
