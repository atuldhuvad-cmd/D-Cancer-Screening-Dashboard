import MainLayout from './layouts/MainLayout'
import { UploadProvider } from './modules/upload/UploadContext'
import ExecutivePage from './modules/executive/ExecutivePage'

function App() {
  return (
    <UploadProvider>
      <MainLayout>
        <ExecutivePage />
      </MainLayout>
    </UploadProvider>
  )
}

export default App
