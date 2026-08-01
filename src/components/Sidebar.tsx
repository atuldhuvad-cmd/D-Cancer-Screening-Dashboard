import '../styles/app.css'
import { navigationItems } from '../types/navigation'

function Sidebar() {
  // Hash-based routing keeps the app portable to any static host (e.g. GitHub
  // Pages under a sub-path) with no server-side rewrite/404 handling. The native
  // anchor sets window.location.hash, which App listens to via 'hashchange'.
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p>Navigation</p>
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <a key={item.path} href={`#${item.path}`} className="nav-link">
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
