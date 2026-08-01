import { useState } from 'react'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import { useFacilities } from '@/hooks/useFacilities'
import { useAuth } from '@/contexts/AuthContext'
import { upsertCase } from '@/hooks/useCases'
import { ASA_OPTIONS, ANESTHESIA_OPTIONS, DEFAULT_CLINICAL_TAGS, DEFAULT_HIGH_RISK_LABELS } from '@/types/database'
import type { Case, AsaClass } from '@/types/database'

interface Props {
  initial?: Partial<Case>
  onSaved: (c: Case) => void
  onCancel: () => void
}

export default function CaseForm({ initial, onSaved, onCancel }: Props) {
  const { user } = useAuth()
  const { facilities } = useFacilities()
  const [mode, setMode] = useState<'quick' | 'advanced'>((initial?.entry_mode as 'quick' | 'advanced') ?? 'quick')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<Case>>({
    patient_full_name: initial?.patient_full_name ?? '',
    file_number: initial?.file_number ?? '',
    case_date: initial?.case_date ?? new Date().toISOString().slice(0, 10),
    facility_id: initial?.facility_id ?? null,
    procedure_name: initial?.procedure_name ?? '',
    surgeon: initial?.surgeon ?? '',
    diagnosis: initial?.diagnosis ?? '',
    medical_history: initial?.medical_history ?? '',
    asa: initial?.asa ?? null,
    airway: initial?.airway ?? '',
    anesthesia_type: initial?.anesthesia_type ?? '',
    complications: initial?.complications ?? '',
    notes: initial?.notes ?? '',
    revenue: initial?.revenue ?? null,
    tags: initial?.tags ?? [],
    research_labels: initial?.research_labels ?? [],
    high_risk_reasons: initial?.high_risk_reasons ?? [],
    id: initial?.id,
  })

  function update<K extends keyof Case>(key: K, value: Case[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleFromArray(key: 'tags' | 'high_risk_reasons', value: string) {
    setForm((f) => {
      const arr = new Set(f[key] ?? [])
      if (arr.has(value)) arr.delete(value)
      else arr.add(value)
      return { ...f, [key]: Array.from(arr) }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      const saved = await upsertCase({
        ...form,
        owner_id: user.id,
        entry_mode: mode,
      })
      onSaved(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save case')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex rounded-lg border border-slate-200 p-1 dark:border-white/10">
        {(['quick', 'advanced'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${
              mode === m ? 'bg-brand-700 text-white' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {m} entry
          </button>
        ))}
      </div>

      {/* Mandatory fields — always shown */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient Full Name" required>
          <Input required value={form.patient_full_name ?? ''} onChange={(e) => update('patient_full_name', e.target.value)} />
        </Field>
        <Field label="File Number" required>
          <Input required value={form.file_number ?? ''} onChange={(e) => update('file_number', e.target.value)} />
        </Field>
        <Field label="Date" required>
          <Input type="date" required value={form.case_date ?? ''} onChange={(e) => update('case_date', e.target.value)} />
        </Field>
        <Field label="Facility" required>
          <Select
            required
            value={form.facility_id ?? ''}
            onChange={(e) => update('facility_id', e.target.value || null)}
          >
            <option value="">Select facility…</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Procedure" required className="sm:col-span-2">
          <Input required value={form.procedure_name ?? ''} onChange={(e) => update('procedure_name', e.target.value)} />
        </Field>
      </div>

      {mode === 'advanced' && (
        <>
          <div className="border-t border-slate-200 pt-4 dark:border-white/10">
            <p className="label-eyebrow mb-3">Clinical detail</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Surgeon">
                <Input value={form.surgeon ?? ''} onChange={(e) => update('surgeon', e.target.value)} />
              </Field>
              <Field label="ASA">
                <Select value={form.asa ?? ''} onChange={(e) => update('asa', (e.target.value || null) as AsaClass | null)}>
                  <option value="">—</option>
                  {ASA_OPTIONS.map((a) => (
                    <option key={a} value={a}>ASA {a}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Anesthesia Type">
                <Select value={form.anesthesia_type ?? ''} onChange={(e) => update('anesthesia_type', e.target.value)}>
                  <option value="">—</option>
                  {ANESTHESIA_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Airway">
                <Input value={form.airway ?? ''} onChange={(e) => update('airway', e.target.value)} />
              </Field>
              <Field label="Diagnosis" className="sm:col-span-2">
                <Textarea value={form.diagnosis ?? ''} onChange={(e) => update('diagnosis', e.target.value)} />
              </Field>
              <Field label="Medical History" className="sm:col-span-2">
                <Textarea value={form.medical_history ?? ''} onChange={(e) => update('medical_history', e.target.value)} />
              </Field>
              <Field label="Complications" className="sm:col-span-2">
                <Textarea value={form.complications ?? ''} onChange={(e) => update('complications', e.target.value)} />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
              </Field>
              <Field label="Revenue (basic fee, USD)">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.revenue ?? ''}
                  onChange={(e) => update('revenue', e.target.value ? Number(e.target.value) : null)}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-white/10">
            <p className="label-eyebrow mb-3">Clinical tags</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CLINICAL_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleFromArray('tags', tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.tags?.includes(tag)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-white/10">
            <p className="label-eyebrow mb-3">High risk flags</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_HIGH_RISK_LABELS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleFromArray('high_risk_reasons', tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.high_risk_reasons?.includes(tag)
                      ? 'border-clinical-red bg-clinical-red text-white'
                      : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Attachments (ECG, Echo, CXR, CT, MRI, Angio, Lab, Other) and research labels can be added from the case detail page after saving.
            </p>
          </div>
        </>
      )}

      {error && <p className="text-sm text-clinical-red">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Case'}</Button>
      </div>
    </form>
  )
}
