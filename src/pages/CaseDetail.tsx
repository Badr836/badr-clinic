import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { deleteCase } from '@/hooks/useCases'
import type { Case, Attachment, AttachmentType } from '@/types/database'
import { ATTACHMENT_TYPES } from '@/types/database'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import CompletionBadge from '@/components/cases/CompletionBadge'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { formatCurrency, formatDate } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [record, setRecord] = useState<Case | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [findingType, setFindingType] = useState<AttachmentType>('ECG')
  const [finding, setFinding] = useState('')

  async function load() {
    if (!id) return
    const { data } = await supabase.from('cases').select('*, facility:facilities(id, name)').eq('id', id).single()
    setRecord(data as unknown as Case)
    const { data: atts } = await supabase.from('attachments').select('*').eq('case_id', id).order('created_at', { ascending: false })
    setAttachments((atts ?? []) as Attachment[])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function addFinding() {
    if (!id || !user || !finding.trim()) return
    await supabase.from('attachments').insert({
      owner_id: user.id,
      case_id: id,
      type: findingType,
      storage_path: `${user.id}/${id}/manual-note`,
      file_name: `${findingType} finding`,
      clinically_important_finding: finding.trim(),
    })
    setFinding('')
    load()
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm('Delete this case permanently? This cannot be undone.')) return
    await deleteCase(id)
    navigate('/cases')
  }

  if (!record) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/cases')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={15} /> Back to cases
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{record.patient_full_name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            File #{record.file_number} · {formatDate(record.case_date)} · {record.facility?.name ?? 'No facility'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {record.is_high_risk && <Badge tone="danger">High Risk</Badge>}
          <CompletionBadge score={record.completion_score} />
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-3 p-4 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Clinical summary</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-400">Procedure</dt><dd>{record.procedure_name}</dd></div>
            <div><dt className="text-slate-400">Surgeon</dt><dd>{record.surgeon ?? '—'}</dd></div>
            <div><dt className="text-slate-400">ASA</dt><dd>{record.asa ? `ASA ${record.asa}` : '—'}</dd></div>
            <div><dt className="text-slate-400">Anesthesia</dt><dd>{record.anesthesia_type ?? '—'}</dd></div>
            <div><dt className="text-slate-400">Airway</dt><dd>{record.airway ?? '—'}</dd></div>
            <div><dt className="text-slate-400">Revenue</dt><dd>{formatCurrency(record.revenue)}</dd></div>
            <div className="col-span-2"><dt className="text-slate-400">Diagnosis</dt><dd>{record.diagnosis ?? '—'}</dd></div>
            <div className="col-span-2"><dt className="text-slate-400">Medical History</dt><dd>{record.medical_history ?? '—'}</dd></div>
            <div className="col-span-2"><dt className="text-slate-400">Complications</dt><dd>{record.complications ?? '—'}</dd></div>
            <div className="col-span-2"><dt className="text-slate-400">Notes</dt><dd>{record.notes ?? '—'}</dd></div>
          </dl>
          {record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {record.tags.map((t) => <Badge key={t} tone="brand">{t}</Badge>)}
            </div>
          )}
        </div>

        <div className="card space-y-3 p-4">
          <h2 className="font-display text-base font-semibold">Attachments &amp; findings</h2>
          <p className="text-xs text-slate-400">Only clinically important findings are stored — not full reports.</p>
          <div className="space-y-2">
            {attachments.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 p-2 text-sm dark:border-white/10">
                <Badge tone="neutral">{a.type}</Badge>
                <p className="mt-1">{a.clinically_important_finding}</p>
              </div>
            ))}
            {attachments.length === 0 && <p className="text-sm text-slate-400">No findings recorded yet.</p>}
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-white/10">
            <Field label="Type">
              <Select value={findingType} onChange={(e) => setFindingType(e.target.value as AttachmentType)}>
                {ATTACHMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Clinically important finding">
              <Textarea value={finding} onChange={(e) => setFinding(e.target.value)} placeholder="e.g. EF 35%, moderate MR" />
            </Field>
            <Button size="sm" onClick={addFinding}><Upload size={14} /> Add finding</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
