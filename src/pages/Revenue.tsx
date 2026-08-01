import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import Stat from '@/components/ui/Stat'
import { formatCurrency, formatDate } from '@/lib/format'
import type { CaseRevenue, Case } from '@/types/database'

type Row = CaseRevenue & { case: Pick<Case, 'patient_full_name' | 'file_number' | 'case_date' | 'procedure_name'> }

export default function Revenue() {
  const [rows, setRows] = useState<Row[]>([])
  const [groupBy, setGroupBy] = useState<'facility' | 'procedure' | 'surgeon' | 'month'>('facility')
  const [grouped, setGrouped] = useState<{ key: string; total: number }[]>([])

  useEffect(() => {
    supabase
      .from('case_revenue')
      .select('*, case:cases(patient_full_name, file_number, case_date, procedure_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data ?? []) as unknown as Row[]))
  }, [])

  useEffect(() => {
    let column = 'facility_name'
    let view = 'v_revenue_by_facility'
    if (groupBy === 'month') { view = 'v_revenue_by_month'; column = 'month' }
    if (groupBy === 'facility') { view = 'v_revenue_by_facility'; column = 'facility_name' }

    if (groupBy === 'procedure' || groupBy === 'surgeon') {
      // computed client-side from cases + revenue since no dedicated view exists for these breakdowns
      supabase
        .from('cases')
        .select(`revenue, ${groupBy}` as 'revenue')
        .then(({ data }) => {
          const map = new Map<string, number>()
          ;(data ?? []).forEach((r: Record<string, unknown>) => {
            const key = (r[groupBy] as string) || 'Unspecified'
            map.set(key, (map.get(key) ?? 0) + ((r.revenue as number) ?? 0))
          })
          setGrouped(Array.from(map, ([key, total]) => ({ key, total })).sort((a, b) => b.total - a.total))
        })
      return
    }

    supabase
      .from(view)
      .select('*')
      .then(({ data }) => {
        setGrouped(
          (data ?? []).map((r: Record<string, unknown>) => ({
            key: String(r[column] ?? 'Unspecified'),
            total: Number(r.total_revenue ?? 0),
          }))
        )
      })
  }, [groupBy])

  const outstanding = useMemo(
    () => rows.filter((r) => r.payment_status !== 'paid').reduce((s, r) => s + (r.final_revenue - r.amount_paid), 0),
    [rows]
  )
  const totalPaid = useMemo(() => rows.reduce((s, r) => s + r.amount_paid, 0), [rows])

  return (
    <div className="space-y-5">
      <div>
        <p className="label-eyebrow">Finance</p>
        <h1 className="font-display text-2xl font-semibold">Revenue</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total Collected" value={formatCurrency(totalPaid)} />
        <Stat label="Outstanding" value={formatCurrency(outstanding)} tone="warning" />
        <Stat label="Records" value={rows.length} />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Analytics</h2>
          <div className="flex gap-1 rounded-lg border border-slate-200 p-1 text-xs dark:border-white/10">
            {(['facility', 'procedure', 'surgeon', 'month'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`rounded-md px-2.5 py-1 font-medium capitalize ${groupBy === g ? 'bg-brand-700 text-white' : 'text-slate-500'}`}
              >
                By {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {grouped.map((g) => (
            <div key={g.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
              <span>{g.key}</span>
              <span className="font-medium">{formatCurrency(g.total)}</span>
            </div>
          ))}
          {grouped.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Basic Fee</th>
                <th className="px-4 py-3">Final Revenue</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.case?.patient_full_name}</td>
                  <td className="px-4 py-3">{formatDate(r.case?.case_date)}</td>
                  <td className="px-4 py-3">{formatCurrency(r.basic_fee)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(r.final_revenue)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={r.payment_status === 'paid' ? 'success' : r.payment_status === 'partially_paid' ? 'warning' : 'danger'}>
                      {r.payment_status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
