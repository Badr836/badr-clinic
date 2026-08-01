import clsx from 'clsx'

export default function CompletionBadge({ score }: { score: number }) {
  const tone = score === 100 ? 'success' : score >= 50 ? 'warning' : 'danger'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className={clsx(
            'h-full rounded-full',
            tone === 'success' && 'bg-emerald-500',
            tone === 'warning' && 'bg-amber-500',
            tone === 'danger' && 'bg-red-500'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{score}%</span>
    </div>
  )
}
