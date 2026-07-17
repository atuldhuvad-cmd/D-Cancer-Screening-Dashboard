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

import { useEffect, useState } from 'react'

function App() {
  const [path, setPath] = useState<string>(() => window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
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
      case '/executive-dashboard':
      default:
        return <ExecutivePage />
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
