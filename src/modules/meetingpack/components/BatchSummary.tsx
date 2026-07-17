// No React import required with new JSX transform

const BatchSummary = ({ batchRequirement }: { batchRequirement: number }) => {
  return (
    <div className="batch-summary">
      <p className="batch-value">{batchRequirement}</p>
      <p className="batch-label">Training batches required</p>
    </div>
  )
}

export default BatchSummary
