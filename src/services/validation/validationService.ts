import { extractWorkbookLike } from '../excelReader'
import type { ValidationIssue, ValidationReport } from '../../types/validation'

const MANDATORY_FIELDS = ['employee id', 'employee name', 'designation', 'facility', 'block', 'district', 'gender', 'age', 'reporting manager', 'sanctioned posts', 'incumbents', 'training value']
const VALID_GENDERS = ['male', 'female', 'other']

const buildIssue = (id: string, severity: ValidationIssue['severity'], category: string, field: string, row: number | null, message: string): ValidationIssue => ({
  id,
  severity,
  category,
  field,
  row,
  message,
})

const normalizeCell = (value: string): string => value.trim().toLowerCase()

const isNumeric = (value: string): boolean => {
  if (value.trim() === '') return false
  return Number.isFinite(Number(value.replace(/,/g, '')))
}

const getHeaderMap = (headerRow: string[]) => {
  const map = new Map<string, number>()
  headerRow.forEach((cell, index) => map.set(normalizeCell(cell), index))
  return map
}

const formatDateTime = (date: Date) => date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export const validateStaffingWorkbook = async (file: File): Promise<ValidationReport> => {
  const workbook = await extractWorkbookLike(file)
  const headers = workbook.rows[0] ?? []
  const headerMap = getHeaderMap(headers)
  const issues: ValidationIssue[] = []

  const missingFields = MANDATORY_FIELDS.filter((field) => !headerMap.has(field))
  missingFields.forEach((field) => {
    issues.push(buildIssue(`missing-${field}`, 'error', 'Missing Fields', field, null, `Mandatory field '${field}' is missing from the header row.`))
  })

  const rows = workbook.rows.slice(1)
  const employeeIdSet = new Map<string, number[]>()
  const nameFacilityMap = new Map<string, string>()
  const blockNames = new Set<string>()
  const districtNames = new Set<string>()

  rows.forEach((row, rowIndex) => {
    const sourceRow = rowIndex + 2
    const getValue = (field: string) => {
      const idx = headerMap.get(field)
      return idx === undefined ? '' : String(row[idx] ?? '').trim()
    }

    const employeeId = getValue('employee id')
    const employeeName = getValue('employee name')
    const facility = getValue('facility')
    const block = getValue('block')
    const district = getValue('district')
    const designation = getValue('designation')
    const sanctionedPosts = getValue('sanctioned posts')
    const incumbents = getValue('incumbents')
    const trainingValue = getValue('training value')
    const gender = getValue('gender')
    const age = getValue('age')
    const reportingManager = getValue('reporting manager')

    if (!employeeId) {
      issues.push(buildIssue(`missing-employee-id-${sourceRow}`, 'error', 'Missing Fields', 'employee id', sourceRow, 'Employee ID is missing.'))
    }

    if (!employeeName) {
      issues.push(buildIssue(`missing-employee-name-${sourceRow}`, 'error', 'Missing Fields', 'employee name', sourceRow, 'Employee name is missing.'))
    }

    if (!designation) {
      issues.push(buildIssue(`missing-designation-${sourceRow}`, 'error', 'Missing Fields', 'designation', sourceRow, 'Designation is missing.'))
    }

    if (!facility) {
      issues.push(buildIssue(`missing-facility-${sourceRow}`, 'error', 'Missing Fields', 'facility', sourceRow, 'Facility is missing.'))
    }

    if (!block) {
      issues.push(buildIssue(`missing-block-${sourceRow}`, 'error', 'Missing Fields', 'block', sourceRow, 'Block name is missing.'))
    }

    if (!district) {
      issues.push(buildIssue(`missing-district-${sourceRow}`, 'error', 'Missing Fields', 'district', sourceRow, 'District name is missing.'))
    }

    if (!sanctionedPosts) {
      issues.push(buildIssue(`missing-sanctioned-posts-${sourceRow}`, 'warning', 'Missing Values', 'sanctioned posts', sourceRow, 'Sanctioned posts value is missing.'))
    }

    if (!incumbents) {
      issues.push(buildIssue(`missing-incumbents-${sourceRow}`, 'warning', 'Missing Values', 'incumbents', sourceRow, 'Incumbents value is missing.'))
    }

    if (!trainingValue) {
      issues.push(buildIssue(`missing-training-value-${sourceRow}`, 'warning', 'Missing Values', 'training value', sourceRow, 'Training value is missing.'))
    }

    if (employeeId) {
      const ids = employeeIdSet.get(employeeId) ?? []
      ids.push(sourceRow)
      employeeIdSet.set(employeeId, ids)
    }

    if (employeeName && facility) {
      const key = `${employeeName.toLowerCase()}|${facility.toLowerCase()}`
      if (nameFacilityMap.has(key)) {
        issues.push(buildIssue(`duplicate-name-${sourceRow}`, 'warning', 'Duplicate Records', 'employee name', sourceRow, `Employee name '${employeeName}' appears more than once in facility '${facility}'.`))
      } else {
        nameFacilityMap.set(key, facility)
      }
    }

    if (designation && designation.toLowerCase() === 'unknown') {
      issues.push(buildIssue(`invalid-designation-${sourceRow}`, 'warning', 'Invalid Values', 'designation', sourceRow, `Invalid designation '${designation}'.`))
    }

    if (facility && facility.toLowerCase().includes('unknown')) {
      issues.push(buildIssue(`invalid-facility-${sourceRow}`, 'warning', 'Invalid Values', 'facility', sourceRow, `Invalid facility name '${facility}'.`))
    }

    if (block && block.toLowerCase().includes('unknown')) {
      issues.push(buildIssue(`invalid-block-${sourceRow}`, 'warning', 'Invalid Values', 'block', sourceRow, `Invalid block name '${block}'.`))
    }

    if (district && district.toLowerCase().includes('unknown')) {
      issues.push(buildIssue(`invalid-district-${sourceRow}`, 'warning', 'Invalid Values', 'district', sourceRow, `Invalid district name '${district}'.`))
    }

    if (trainingValue && !isNumeric(trainingValue)) {
      issues.push(buildIssue(`invalid-training-value-${sourceRow}`, 'error', 'Invalid Values', 'training value', sourceRow, `Training value '${trainingValue}' is not numeric.`))
    }

    if (sanctionedPosts && !isNumeric(sanctionedPosts)) {
      issues.push(buildIssue(`invalid-sanctioned-posts-${sourceRow}`, 'error', 'Invalid Values', 'sanctioned posts', sourceRow, `Sanctioned posts '${sanctionedPosts}' is not numeric.`))
    }

    if (incumbents && !isNumeric(incumbents)) {
      issues.push(buildIssue(`invalid-incumbents-${sourceRow}`, 'error', 'Invalid Values', 'incumbents', sourceRow, `Incumbents '${incumbents}' is not numeric.`))
    }

    if (gender && !VALID_GENDERS.includes(gender.toLowerCase())) {
      issues.push(buildIssue(`invalid-gender-${sourceRow}`, 'warning', 'Invalid Values', 'gender', sourceRow, `Invalid gender value '${gender}'.`))
    }

    if (age && !isNumeric(age)) {
      issues.push(buildIssue(`invalid-age-${sourceRow}`, 'warning', 'Invalid Values', 'age', sourceRow, `Invalid age '${age}' is not numeric.`))
    }

    if (reportingManager && reportingManager.toLowerCase().includes('unknown')) {
      issues.push(buildIssue(`invalid-reporting-manager-${sourceRow}`, 'warning', 'Invalid Values', 'reporting manager', sourceRow, `Invalid reporting hierarchy value '${reportingManager}'.`))
    }

    if (block) blockNames.add(block)
    if (district) districtNames.add(district)
  })

  employeeIdSet.forEach((rows, employeeId) => {
    if (rows.length > 1) {
      rows.forEach((row) => {
        issues.push(buildIssue(`duplicate-employee-id-${employeeId}-${row}`, 'error', 'Duplicate Records', 'employee id', row, `Duplicate Employee ID '${employeeId}' found at row ${row}.`))
      })
    }
  })

  const summary = {
    total: issues.length,
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    info: issues.filter((issue) => issue.severity === 'info').length,
  }

  const report: ValidationReport = {
    metadata: {
      filename: file.name,
      generatedAt: formatDateTime(new Date()),
      rowCount: rows.length,
      columns: headers,
    },
    summary,
    issues,
  }

  return report
}
