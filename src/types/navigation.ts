export interface NavigationItem {
  label: string
  path: string
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Upload Data', path: '/upload-data' },
  { label: 'Validation', path: '/validation' },
  { label: 'Designation Mapping', path: '/designation-mapping' },
  { label: 'Executive Dashboard', path: '/executive-dashboard' },
  { label: 'Workforce Intelligence', path: '/workforce-intelligence' },
  { label: 'Block Intelligence', path: '/block-intelligence' },
  { label: 'Facility Intelligence', path: '/facility-intelligence' },
  { label: 'Planning Workspace', path: '/planning-workspace' },
  { label: 'Meeting Pack', path: '/meeting-pack' },
  { label: 'Reports', path: '/reports' },
  { label: 'Settings', path: '/settings' },
  { label: 'About', path: '/about' },
]
