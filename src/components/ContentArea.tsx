import '../styles/app.css'

interface ContentAreaProps {
  children: React.ReactNode
}

function ContentArea({ children }: ContentAreaProps) {
  return <main className="content-area">{children}</main>
}

export default ContentArea
