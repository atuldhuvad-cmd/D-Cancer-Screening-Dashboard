import '../styles/app.css'

interface PlaceholderPageProps {
  label: string
}

/**
 * Intentional landing for navigation sections that are declared in the sidebar
 * but not yet built as their own view. Shows the real section title so the link
 * never misrepresents where it goes.
 */
function PlaceholderPage({ label }: PlaceholderPageProps) {
  return (
    <section className="placeholder-page page">
      <div className="page-intro">
        <p className="eyebrow">Planned Section</p>
        <h2>{label}</h2>
      </div>

      <div className="panel placeholder-panel">
        <p className="placeholder-panel__title">This section is planned</p>
        <p className="placeholder-panel__detail">
          {label} is part of the platform roadmap and is not available yet. It will appear here once it is built.
        </p>
      </div>
    </section>
  )
}

export default PlaceholderPage
