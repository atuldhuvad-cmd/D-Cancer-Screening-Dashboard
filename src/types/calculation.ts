export interface CalculationSummary {
  workforce: number
  trained: number
  gap: number
  readiness: number
}

export interface DistrictSummary extends CalculationSummary {
  district: string
}

export interface BlockSummary extends CalculationSummary {
  block: string
}

export interface FacilitySummary extends CalculationSummary {
  block: string
  facility: string
}

export interface DesignationSummary extends CalculationSummary {
  designation: string
}

export interface PriorityItem {
  name: string
  gap: number
  readiness: number
}

export interface CalculationReportData {
  district: DistrictSummary
  blocks: BlockSummary[]
  facilities: FacilitySummary[]
  designations: DesignationSummary[]
  priorityBlocks: PriorityItem[]
  priorityFacilities: PriorityItem[]
  priorityDesignations: PriorityItem[]
  batchRequirement: number
}
