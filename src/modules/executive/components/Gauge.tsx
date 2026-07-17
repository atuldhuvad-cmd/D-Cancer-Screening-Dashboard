interface GaugeProps {
  value: number // 0-100+ actual value
}

function Gauge({ value }: GaugeProps) {
  const displayValue = value > 100 ? 100 : value
  const angle = (displayValue / 100) * 180
  const radius = 56
  const cx = 64
  const r = radius
  const circumference = Math.PI * r
  const dash = (displayValue / 100) * circumference

  return (
    <div className="gauge">
      <svg viewBox="0 0 128 80" width="100%" height="160" role="img" aria-label={`Readiness ${value.toFixed(1)}%`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <g transform={`translate(${cx - r}, 0)`}> 
          <path d={`M${r},${r} a${r},${r} 0 0 1 ${2 * r},0`} fill="none" stroke="#e6eef6" strokeWidth="12" strokeLinecap="round" />
          <path d={`M${r},${r} a${r},${r} 0 0 1 ${2 * r},0`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} transform={`rotate(${angle - 180} ${r} ${r})`} />
        </g>
        <text x="64" y="60" textAnchor="middle" fontSize="14" fill="#102a43">{value > 100 ? `${value.toFixed(1)}%*` : `${value.toFixed(1)}%`}</text>
        <text x="64" y="76" textAnchor="middle" fontSize="11" fill="#5b6b7a">District readiness</text>
      </svg>
    </div>
  )
}

export default Gauge
