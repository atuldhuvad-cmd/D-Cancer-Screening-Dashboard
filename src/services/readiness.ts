export const calculateReadiness = (trained: number, workforce: number): number => {
  if (workforce === 0) {
    return 100
  }

  const percentage = (trained / workforce) * 100
  return percentage > 100 ? 100 : percentage
}
