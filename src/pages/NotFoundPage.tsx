import '../styles/app.css'

/**
 * Shown for any URL that does not match a known route, instead of silently
 * falling back to the Executive dashboard.
 */
function NotFoundPage() {
  return (
    <section className="not-found-page page">
      <div className="page-intro">
        <p className="eyebrow">404</p>
        <h2>Page not found</h2>
      </div>

      <div className="panel placeholder-panel">
        <p className="placeholder-panel__title">This page does not exist</p>
        <p className="placeholder-panel__detail">
          The requested address did not match any section. Use the sidebar to navigate to an available view.
        </p>
      </div>
    </section>
  )
}

export default NotFoundPage
