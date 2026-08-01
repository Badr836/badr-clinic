import clsx from 'clsx'
import type { ReactNode } from 'react'

const styles = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300',
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
}

export default function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: keyof typeof styles }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[tone])}>
      {children}
    </span>
  )
}
