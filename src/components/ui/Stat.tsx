import type { ReactNode } from 'react'
import clsx from 'clsx'

export default function Stat({
  label, value, hint, icon, tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'warning' | 'danger'
}) {
  return (
    <div className="card flex items-start justify-between gap-3 p-4">
      <div>
        <p className="label-eyebrow">{label}</p>
        <p
          className={clsx(
            'mt-1 font-display text-2xl font-semibold',
            tone === 'warning' && 'text-clinical-amber',
            tone === 'danger' && 'text-clinical-red'
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      {icon && (
        <div className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-white/5 dark:text-brand-300">{icon}</div>
      )}
    </div>
  )
}
