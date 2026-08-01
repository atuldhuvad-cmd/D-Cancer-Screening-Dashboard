import MainLayout from './layouts/MainLayout'
import { UploadProvider } from './modules/upload/UploadContext'
import ExecutivePage from './modules/executive/ExecutivePage'
import UploadPage from './modules/upload/UploadPage'
import IntelligencePage from './modules/intelligence/IntelligencePage'
import PlanningWorkspacePage from './modules/planning/PlanningWorkspacePage'
import MeetingPackPage from './modules/meetingpack/MeetingPackPage'
import PresentationPage from './modules/presentation/PresentationPage'
import ValidationPage from './modules/validation/ValidationPage'
import AdminPage from './modules/admin/AdminPage'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'
import NotFoundPage from './pages/NotFoundPage'
import { navigationItems } from './types/navigation'

import { useEffect, useState } from 'react'

// Nav sections declared in the sidebar but not yet built as their own view.
const plannedPaths = new Set([
  '/designation-mapping',
  '/block-intelligence',
  '/facility-intelligence',
  '/reports',
  '/settings',
  '/about',
])

const labelForPath = (path: string): string =>
  navigationItems.find((item) => item.path === path)?.label ?? path

const getRoutePath = (): string => window.location.hash.replace(/^#/, '') || '/'

function App() {
  const [path, setPath] = useState<string>(getRoutePath)

  useEffect(() => {
    const onHashChange = () => setPath(getRoutePath())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const renderRoute = () => {
    switch (path) {
      case '/upload-data':
        return <UploadPage />
      case '/validation':
        return <ValidationPage />
      case '/workforce-intelligence':
        return <IntelligencePage />
      case '/planning-workspace':
        return <PlanningWorkspacePage />
      case '/meeting-pack':
        return <MeetingPackPage />
      case '/presentation-mode':
        return <PresentationPage />
      case '/admin':
        return <AdminPage />
      case '/dashboard':
        return <HomePage />
      case '/':
      case '/executive-dashboard':
        return <ExecutivePage />
      default:
        return plannedPaths.has(path) ? <PlaceholderPage label={labelForPath(path)} /> : <NotFoundPage />
    }
  }

  return (
    <UploadProvider>
      <MainLayout>
        {renderRoute()}
      </MainLayout>
    </UploadProvider>
  )
}

export default App
