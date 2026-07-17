export const PDF_THEME = {
  primary: '#004d64',
  accent: '#0c7c8c',
  text: '#1f2f3a',
  heading: '#082f3c',
  divider: '#dbe9ec',
  footer: '#5f6c73',
  callout: '#0a7d8a',
  background: '#ffffff',
}

export const PDF_FONTS = {
  normal: 'helvetica',
  bold: 'helvetica',
}

export const PDF_SIZES = {
  title: 22,
  section: 14,
  label: 10,
  body: 9,
  small: 8,
}

export const PAGE_MARGIN = 18
export const CONTENT_WIDTH = 210 - PAGE_MARGIN * 2

export const formatReadinessDisplay = (readiness: number) => {
  if (readiness > 100) return `${Math.min(readiness, 100).toFixed(1)}%*`
  return `${readiness.toFixed(1)}%`
}

export const formatNumber = (value: number) => value.toLocaleString('en-IN')

export const formatDateTime = (date: Date) => date.toLocaleString('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
