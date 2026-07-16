import '../styles/app.css'

const currentDate = new Date().toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function TopHeader() {
  return (
    <header className="top-header">
      <div className="header-brand">
        <div className="header-badge">GOV</div>
        <div>
          <p className="header-entity">Government of Gujarat</p>
          <h1>Health & Family Welfare Department</h1>
          <p className="header-subtitle">Workforce Training Intelligence Platform</p>
        </div>
      </div>
      <div className="header-meta">
        <p className="meta-label">WTIP Version 2.0</p>
        <p className="meta-value">{currentDate}</p>
      </div>
    </header>
  )
}

export default TopHeader
