import MainLayout from './layouts/MainLayout'
import { UploadProvider } from './modules/upload/UploadContext'
import ExecutivePage from './modules/executive/ExecutivePage'
import UploadPage from './modules/upload/UploadPage'
import IntelligencePage from './modules/intelligence/IntelligencePage'
import MeetingPackPage from './modules/meetingpack/MeetingPackPage'

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
      case '/workforce-intelligence':
        return <IntelligencePage />
      case '/meeting-pack':
        return <MeetingPackPage />
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
