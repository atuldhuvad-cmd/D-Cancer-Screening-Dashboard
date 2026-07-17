// No React import required with new JSX transform
import type { PriorityItem } from '../../../types/calculation'

const PriorityList = ({ items }: { items: PriorityItem[] }) => {
  if (!items || items.length === 0) return <div className="small-chart__empty">No priority items</div>

  return (
    <div className="priority-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Gap</th>
            <th>Readiness</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={`${it.name}-${i}`}>
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

export default PriorityList
