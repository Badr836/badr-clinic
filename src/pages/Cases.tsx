import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus, Search, Download, AlertTriangle } from 'lucide-react'
import { useCases } from '@/hooks/useCases'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import CompletionBadge from '@/components/cases/CompletionBadge'
import CaseForm from '@/components/cases/CaseForm'
import { Input } from '@/components/ui/Field'
import { formatDate, formatCurrency } from '@/lib/format'
import { generateFinancialPDF, generateLogbookPDF } from '@/lib/pdf'

export default function Cases() {
  const [params, setParams] = useSearchParams()
  const incompleteOnly = params.get('filter') === 'incomplete'
  const [highRiskOnly, setHighRiskOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(params.get('quick') === '1')

  const { cases, loading, refresh } = useCases({ incompleteOnly, highRiskOnly })

  const filtered = useMemo(() => {
    if (!search.trim()) return cases
    const q = search.toLowerCase()
    return cases.filter(
      (c) => c.patient_full_name.toLowerCase().includes(q) || c.file_number.toLowerCase().includes(q)
    )
  }, [cases, search])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-eyebrow">Clinical records</p>
          <h1 className="font-display text-2xl font-semibold">Cases</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => generateFinancialPDF(filtered)}>
            <Download size={15} /> Financial PDF
          </Button>
          <Button variant="secondary" onClick={() => generateLogbookPDF(filtered)}>
            <Download size={15} /> Logbook PDF
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={15} /> New Case
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search by patient or file number…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button
          onClick={() => setParams(incompleteOnly ? {} : { filter: 'incomplete' })}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${incompleteOnly ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10' : 'border-slate-200 dark:border-white/10'}`}
        >
          Incomplete only
        </button>
        <button
          onClick={() => setHighRiskOnly((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${highRiskOnly ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10' : 'border-slate-200 dark:border-white/10'}`}
        >
          High risk only
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">File #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Procedure</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Completion</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading cases…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No cases match these filters.</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/cases/${c.id}`} className="hover:text-brand-600">{c.patient_full_name}</Link>
                    {c.is_high_risk && (
                      <span className="ml-2 inline-flex items-center gap-1 text-clinical-red">
                        <AlertTriangle size={13} />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.file_number}</td>
                  <td className="px-4 py-3">{formatDate(c.case_date)}</td>
                  <td className="px-4 py-3">{c.facility?.name ?? '—'}</td>
                  <td className="px-4 py-3">{c.procedure_name}</td>
                  <td className="px-4 py-3">{formatCurrency(c.revenue)}</td>
                  <td className="px-4 py-3"><CompletionBadge score={c.completion_score} /></td>
                  <td className="px-4 py-3">
                    {c.asa && <Badge tone="brand">ASA {c.asa}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Case" wide>
        <CaseForm
          onCancel={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            refresh()
          }}
        />
      </Modal>
    </div>
  )
}
