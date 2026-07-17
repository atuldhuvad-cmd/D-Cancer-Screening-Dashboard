export interface DistrictConfig {
  id: string
  name: string
  code?: string
  description?: string
}

export interface BlockConfig {
  id: string
  districtId: string
  name: string
  code?: string
  description?: string
}

export interface FacilityConfig {
  id: string
  blockId: string
  name: string
  code?: string
  description?: string
}

export interface DesignationConfig {
  id: string
  name: string
  code?: string
  description?: string
}

export interface TrainingCategoryConfig {
  id: string
  name: string
  description?: string
}

export interface AdminConfiguration {
  districts: DistrictConfig[]
  blocks: BlockConfig[]
  facilities: FacilityConfig[]
  designations: DesignationConfig[]
  trainingCategories: TrainingCategoryConfig[]
}

export interface ConfigurationBackup {
  id: string
  label: string
  createdAt: string
  configuration: AdminConfiguration
}
