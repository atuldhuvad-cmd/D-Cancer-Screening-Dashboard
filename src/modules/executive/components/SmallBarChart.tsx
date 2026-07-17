interface Item {
  name: string
  value: number
}

interface SmallBarChartProps {
  title: string
  items: Item[]
  maxValue?: number
}

function SmallBarChart({ title, items, maxValue }: SmallBarChartProps) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="small-chart">
      <p className="small-chart__title">{title}</p>
      <svg viewBox={`0 0 300 ${items.length * 28}`} width="100%" height={`${items.length * 28}px`}>
        {items.map((item, idx) => {
          const barWidth = Math.round((item.value / max) * 260)
          const y = idx * 28
          return (
            <g key={item.name} transform={`translate(0, ${y})`}>
              <text x="0" y="16" fontSize="11" fill="#102a43">{item.name}</text>
              <rect x="120" y="4" width="260" height="14" fill="#f1f5f9" rx="6" />
              <rect x="120" y="4" width={barWidth} height="14" fill="#0f766e" rx="6" />
              <text x="388" y="16" fontSize="11" fill="#102a43">{String(item.value)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default SmallBarChart
