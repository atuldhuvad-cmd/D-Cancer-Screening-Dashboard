export const estimateBatches = (gap: number, batchCapacity = 30): number => {
  if (gap <= 0) {
    return 0
  }

  return Math.ceil(gap / batchCapacity)
}
