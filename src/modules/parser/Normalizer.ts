import type { ParsedRecord, ParserValidationIssue } from '../../types/parser'

export const normalizeRecords = (records: ParsedRecord[]): { records: ParsedRecord[]; warnings: ParserValidationIssue[]; errors: ParserValidationIssue[] } => {
  const uniqueFacilities = new Set<string>()
  const warnings: ParserValidationIssue[] = []
  const errors: ParserValidationIssue[] = []

  const normalized = records.map((record) => {
    const facilityKey = `${record.block.toLowerCase()}|${record.facility.toLowerCase()}`

    if (!record.block.trim()) {
      errors.push({ type: 'error', message: `Blank block at row ${record.sourceRow}` })
    }

    if (!record.facility.trim()) {
      errors.push({ type: 'error', message: `Blank facility at row ${record.sourceRow}` })
    }

    if (!record.designation.trim()) {
      errors.push({ type: 'error', message: `Blank designation at row ${record.sourceRow}` })
    }

    if (record.workforce < 0) {
      errors.push({ type: 'error', message: `Negative number at row ${record.sourceRow}` })
    }

    if (uniqueFacilities.has(facilityKey)) {
      warnings.push({ type: 'warning', message: `Duplicate facility detected for ${record.facility}` })
    } else {
      uniqueFacilities.add(facilityKey)
    }

    return {
      ...record,
      block: record.block.trim(),
      facility: record.facility.trim(),
      designation: record.designation.trim(),
    }
  })

  return { records: normalized, warnings, errors }
}
