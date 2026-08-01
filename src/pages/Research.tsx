import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Case, ResearchCollection, ResearchFilters, AsaClass } from '@/types/database'
import { ASA_OPTIONS } from '@/types/database'
import { Field, Input, Select } from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/format'

export default function Research() {
  const [collections, setCollections] = useState<ResearchCollection[]>([])
  const [filters, setFilters] = useState<ResearchFilters>({})
  const [results, setResults] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('research_collections').select('*').order('name').then(({ data }) => setCollections((data ?? []) as ResearchCollection[]))
  }, [])

  async function runQuery(f: ResearchFilters) {
    setLoading(true)
    let query = supabase.from('cases').select('*, facility:facilities(id, name)')
    if (f.facility_id) query = query.eq('facility_id', f.facility_id)
    if (f.surgeon) query = query.ilike('surgeon', `%${f.surgeon}%`)
    if (f.procedure_contains) query = query.ilike('procedure_name', `%${f.procedure_contains}%`)
    if (f.asa && f.asa.length) query = query.in('asa', f.asa)
    if (f.diagnosis_contains) query = query.ilike('diagnosis', `%${f.diagnosis_contains}%`)
    if (f.medical_history_contains) query = query.ilike('medical_history', `%${f.medical_history_contains}%`)
    if (f.anesthesia_type) query = query.eq('anesthesia_type', f.anesthesia_type)
    if (f.complications_contains) query = query.ilike('complications', `%${f.complications_contains}%`)
    if (f.tags && f.tags.length) query = query.contains('tags', f.tags)
    if (f.high_risk_only) query = query.eq('is_high_risk', true)
    if (f.date_from) query = query.gte('case_date', f.date_from)
    if (f.date_to) query = query.lte('case_date', f.date_to)

    const { data } = await query.order('case_date', { ascending: false }).limit(500)
    setResults((data ?? []) as unknown as Case[])
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label-eyebrow">Academic</p>
        <h1 className="font-display text-2xl font-semibold">Research</h1>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Saved collections</h2>
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setFilters(c.filters)
                runQuery(c.filters)
              }}
              className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-brand-300"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Advanced filters</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Surgeon">
            <Input value={filters.surgeon ?? ''} onChange={(e) => setFilters((f) => ({ ...f, surgeon: e.target.value }))} />
          </Field>
          <Field label="Procedure contains">
            <Input value={filters.procedure_contains ?? ''} onChange={(e) => setFilters((f) => ({ ...f, procedure_contains: e.target.value }))} />
          </Field>
          <Field label="Diagnosis contains">
            <Input value={filters.diagnosis_contains ?? ''} onChange={(e) => setFilters((f) => ({ ...f, diagnosis_contains: e.target.value }))} />
          </Field>
          <Field label="Medical history contains">
            <Input value={filters.medical_history_contains ?? ''} onChange={(e) => setFilters((f) => ({ ...f, medical_history_contains: e.target.value }))} />
          </Field>
          <Field label="Complications contains">
            <Input value={filters.complications_contains ?? ''} onChange={(e) => setFilters((f) => ({ ...f, complications_contains: e.target.value }))} />
          </Field>
          <Field label="ASA">
            <Select
              multiple
              value={filters.asa ?? []}
              onChange={(e) => setFilters((f) => ({ ...f, asa: Array.from(e.target.selectedOptions, (o) => o.value as AsaClass) }))}
            >
              {ASA_OPTIONS.map((a) => <option key={a} value={a}>ASA {a}</option>)}
            </Select>
          </Field>
          <Field label="Date from">
            <Input type="date" value={filters.date_from ?? ''} onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))} />
          </Field>
          <Field label="Date to">
            <Input type="date" value={filters.date_to ?? ''} onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))} />
          </Field>
          <Field label="High risk only">
            <Select
              value={filters.high_risk_only ? 'yes' : 'no'}
              onChange={(e) => setFilters((f) => ({ ...f, high_risk_only: e.target.value === 'yes' }))}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Field>
        </div>
        <Button className="mt-4" onClick={() => runQuery(filters)}>{loading ? 'Searching…' : 'Run search'}</Button>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Results</h2>
          <Badge tone="brand">{results.length} cases</Badge>
        </div>
        <div className="space-y-2">
          {results.map((c) => (
            <div key={c.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.procedure_name}</p>
                <span className="text-xs text-slate-400">{formatDate(c.case_date)}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.diagnosis ?? 'No diagnosis recorded'}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {c.asa && <Badge>ASA {c.asa}</Badge>}
                {c.tags.map((t) => <Badge key={t} tone="brand">{t}</Badge>)}
              </div>
            </div>
          ))}
          {results.length === 0 && <p className="text-sm text-slate-400">Run a search or pick a saved collection to see results.</p>}
        </div>
      </div>
    </div>
  )
}
