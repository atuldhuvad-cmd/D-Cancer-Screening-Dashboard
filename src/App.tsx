import MainLayout from './layouts/MainLayout'
import { UploadProvider } from './modules/upload/UploadContext'
import IntelligencePage from './modules/intelligence/IntelligencePage'

function App() {
  return (
    <UploadProvider>
      <MainLayout>
        <IntelligencePage />
      </MainLayout>
    </UploadProvider>
  )
}

export default App
