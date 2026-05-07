import { Bot, CheckCircle2, CirclePause, Hammer, RotateCcw, Settings2, XCircle } from 'lucide-react'

interface Props { status: string; message: string; onRetry?: () => void }

const statusConfig = {
  idle:          { color: 'bg-slate-100 text-slate-600',   Icon: CirclePause },
  generating:    { color: 'bg-blue-50 text-blue-700',      Icon: Bot },
  applying:      { color: 'bg-indigo-50 text-indigo-700',  Icon: Settings2 },
  materializing: { color: 'bg-purple-50 text-purple-700',  Icon: Hammer },
  done:          { color: 'bg-green-50 text-green-700',    Icon: CheckCircle2 },
  failed:        { color: 'bg-red-50 text-red-700',        Icon: XCircle },
}

export default function OrganizeStatus({ status, message, onRetry }: Props) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.idle
  const Icon = cfg.Icon
  const isRunning = ['generating', 'applying', 'materializing'].includes(status)

  return (
    <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${cfg.color}`}>
      <Icon className="size-5" />
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
        {isRunning && (
          <div className="mt-1 h-1 w-full bg-white rounded overflow-hidden">
            <div className="h-1 bg-current rounded animate-pulse w-2/3" />
          </div>
        )}
      </div>
      {status === 'failed' && onRetry && (
        <button onClick={onRetry} className="inline-flex items-center gap-1 text-sm underline">
          <RotateCcw className="size-3.5" />
          Retry
        </button>
      )}
    </div>
  )
}
