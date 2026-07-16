import type { DesignationAlias } from '../types/designation'

export const designationAliases: DesignationAlias[] = [
  { alias: 'medical officer', canonical: 'Medical Officer' },
  { alias: 'mo', canonical: 'Medical Officer' },
  { alias: 'staff nurse', canonical: 'Staff Nurse' },
  { alias: 'sn', canonical: 'Staff Nurse' },
  { alias: 'community health officer', canonical: 'Community Health Officer' },
  { alias: 'cho', canonical: 'Community Health Officer' },
  { alias: 'mphw(m)', canonical: 'MPW' },
  { alias: 'mpw(m)', canonical: 'MPW' },
  { alias: 'male health worker', canonical: 'MPW' },
  { alias: 'mpw', canonical: 'MPW' },
  { alias: 'mphw(f)', canonical: 'FHW' },
  { alias: 'female health worker', canonical: 'FHW' },
  { alias: 'fhw', canonical: 'FHW' },
  { alias: 'anm', canonical: 'ANM' },
  { alias: 'lab technician', canonical: 'Lab Technician' },
  { alias: 'lt', canonical: 'Lab Technician' },
  { alias: 'pharmacist', canonical: 'Pharmacist' },
  { alias: 'pharm', canonical: 'Pharmacist' },
]

export const normalizeDesignation = (value: string): string => {
  const trimmed = value.trim().toLowerCase()
  const match = designationAliases.find((alias) => alias.alias === trimmed)
  return match?.canonical ?? value.trim()
}
