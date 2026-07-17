interface KpiCardProps {
  title: string
  value: string
  subValue?: string
}

function KpiCard({ title, value, subValue }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
      {subValue ? <p className="kpi-sub">{subValue}</p> : null}
    </div>
  )
}

export default KpiCard
