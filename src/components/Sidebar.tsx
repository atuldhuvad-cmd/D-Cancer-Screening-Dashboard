import '../styles/app.css'
import { navigationItems } from '../types/navigation'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p>Navigation</p>
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <a key={item.path} href={item.path} className="nav-link">
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
