export const normalizeFacility = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ')
}
