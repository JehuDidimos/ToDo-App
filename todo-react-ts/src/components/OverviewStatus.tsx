type OverviewStatusProps = {
  error: string | null
  hasTodos: boolean
  isLoading: boolean
  remainingCount: number
  totalCount: number
  onRetry: () => void
}

export function OverviewStatus({
  error,
  hasTodos,
  isLoading,
  remainingCount,
  totalCount,
  onRetry,
}: OverviewStatusProps) {
  return (
    <div className="subtitle" aria-live="polite">
      {error ? (
        <button type="button" className="pill danger" onClick={onRetry}>
          {error} — retry
        </button>
      ) : isLoading ? (
        <span className="pill muted">Loading tasks…</span>
      ) : hasTodos ? (
        <>
          <span className="pill">{remainingCount} remaining</span>
          <span className="pill muted">{totalCount} total</span>
        </>
      ) : (
        <span className="pill muted">Add your first task</span>
      )}
    </div>
  )
}
