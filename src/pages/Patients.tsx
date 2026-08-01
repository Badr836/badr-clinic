import { useState } from 'react'
import { Search } from 'lucide-react'
import { usePatients } from '@/hooks/usePatients'
import { useCases } from '@/hooks/useCases'
import { Input } from '@/components/ui/Field'
import { formatDate } from '@/lib/format'
import type { Patient } from '@/types/database'

export default function Patients() {
  const [search, setSearch] = useState('')
  const { patients, loading } = usePatients(search)
  const [selected, setSelected] = useState<Patient | null>(null)
  const { cases } = useCases()

  const timeline = selected ? cases.filter((c) => c.file_number === selected.file_number) : []

  return (
    <div className="space-y-4">
      <div>
        <p className="label-eyebrow">Registry</p>
        <h1 className="font-display text-2xl font-semibold">Patients</h1>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by name or file number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          list="patient-suggestions"
        />
        <datalist id="patient-suggestions">
          {patients.map((p) => <option key={p.id} value={p.full_name} />)}
        </datalist>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {loading && <p className="p-4 text-sm text-slate-400">Loading…</p>}
            {!loading && patients.length === 0 && <p className="p-4 text-sm text-slate-400">No patients found.</p>}
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5 ${selected?.id === p.id ? 'bg-brand-50 dark:bg-white/5' : ''}`}
              >
                <p className="font-medium">{p.full_name}</p>
                <p className="text-xs text-slate-400">File #{p.file_number}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          {!selected && <p className="text-sm text-slate-400">Select a patient to view their case timeline.</p>}
          {selected && (
            <>
              <h2 className="font-display text-base font-semibold">{selected.full_name}</h2>
              <p className="mb-4 text-xs text-slate-400">File #{selected.file_number}</p>
              {selected.notes && <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-white/5">{selected.notes}</p>}
              <div className="space-y-3">
                {timeline.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10">
                    <p className="font-medium">{c.procedure_name}</p>
                    <p className="text-xs text-slate-400">{formatDate(c.case_date)} · {c.facility?.name ?? '—'}</p>
                  </div>
                ))}
                {timeline.length === 0 && <p className="text-sm text-slate-400">No cases recorded for this patient yet.</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
