import '../styles/app.css'

interface StatCardProps {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  )
}

function HomePage() {
  return (
    <section className="home-page">
      <div className="page-intro">
        <p className="eyebrow">District Operations Overview</p>
        <h2>Training readiness and workforce management</h2>
        <p>
          This workspace provides a secure and structured interface for district teams to monitor training readiness,
          manage programme coordination, and prepare for operational planning.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard label="District" value="Gandhinagar" />
        <StatCard label="Programme" value="Cancer Screening" />
        <StatCard label="Reporting Month" value="July 2026" />
        <StatCard label="Total Workforce" value="1,248" />
        <StatCard label="Total Trained" value="934" />
        <StatCard label="Readiness %" value="74.9%" />
        <StatCard label="Planning Gap" value="14 districts" />
      </div>
    </section>
  )
}

export default HomePage
