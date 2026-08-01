import type { LabelHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export function Field({
  label, required, children, hint, className,
}: {
  label: string
  required?: boolean
  children: ReactNode
  hint?: string
  className?: string
} & LabelHTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-clinical-red">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

const baseInput =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 dark:border-white/10 dark:bg-brand-900/40 dark:text-slate-100'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(baseInput, props.className)} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(baseInput, 'min-h-[80px]', props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(baseInput, props.className)} />
}
