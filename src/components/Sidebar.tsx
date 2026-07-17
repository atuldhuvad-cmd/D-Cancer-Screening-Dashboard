import '../styles/app.css'
import { navigationItems } from '../types/navigation'

function Sidebar() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault()
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p>Navigation</p>
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <a key={item.path} href={item.path} className="nav-link" onClick={(e) => handleNavClick(e, item.path)}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
