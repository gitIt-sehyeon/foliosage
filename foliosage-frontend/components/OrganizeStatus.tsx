interface Props { status: string; message: string; onRetry?: () => void }

const statusConfig: Record<string, { color: string; icon: string }> = {
  idle:          { color: 'bg-slate-100 text-slate-600',   icon: '⏸️' },
  generating:    { color: 'bg-blue-50 text-blue-700',      icon: '🤖' },
  applying:      { color: 'bg-indigo-50 text-indigo-700',  icon: '⚙️' },
  materializing: { color: 'bg-purple-50 text-purple-700',  icon: '🔨' },
  done:          { color: 'bg-green-50 text-green-700',    icon: '✅' },
  failed:        { color: 'bg-red-50 text-red-700',        icon: '❌' },
}

export default function OrganizeStatus({ status, message, onRetry }: Props) {
  const cfg = statusConfig[status] ?? statusConfig.idle
  const isRunning = ['generating', 'applying', 'materializing'].includes(status)

  return (
    <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${cfg.color}`}>
      <span className="text-xl">{cfg.icon}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
        {isRunning && (
          <div className="mt-1 h-1 w-full bg-white rounded overflow-hidden">
            <div className="h-1 bg-current rounded animate-pulse w-2/3" />
          </div>
        )}
      </div>
      {status === 'failed' && onRetry && (
        <button onClick={onRetry} className="text-sm underline">Retry</button>
      )}
    </div>
  )
}
