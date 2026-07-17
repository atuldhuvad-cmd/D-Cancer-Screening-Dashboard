interface PriorityItem {
  name: string
  gap: number
  readiness: number
}

interface PriorityTableProps {
  title: string
  items: PriorityItem[]
}

function PriorityTable({ title, items }: PriorityTableProps) {
  return (
    <div className="priority-table">
      <h4>{title}</h4>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Gap</th>
            <th>Readiness</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.name}>
              <td>{it.name}</td>
              <td>{it.gap}</td>
              <td>{it.readiness.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PriorityTable
