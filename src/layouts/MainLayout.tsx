import '../styles/app.css'
import TopHeader from '../components/TopHeader'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import ContentArea from '../components/ContentArea'

interface MainLayoutProps {
  children: React.ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="app-shell">
      <TopHeader />
      <div className="main-content">
        <Sidebar />
        <ContentArea>{children}</ContentArea>
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout
