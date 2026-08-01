import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFacilities } from '@/hooks/useFacilities'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'

export default function Facilities() {
  const { facilities, refresh } = useFacilities()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [pct, setPct] = useState('0')
  const [notes, setNotes] = useState('')

  async function save() {
    if (!user || !name.trim()) return
    await supabase.from('facilities').insert({
      owner_id: user.id,
      name: name.trim(),
      default_deduction_percentage: Number(pct) || 0,
      notes,
    })
    setOpen(false)
    setName('')
    setPct('0')
    setNotes('')
    refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Practice settings</p>
          <h1 className="font-display text-2xl font-semibold">Facilities</h1>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={15} /> Add Facility</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => (
          <div key={f.id} className="card p-4">
            <p className="font-display text-base font-semibold">{f.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Default deduction: {f.default_deduction_percentage}%
            </p>
            {f.notes && <p className="mt-2 text-sm text-slate-400">{f.notes}</p>}
          </div>
        ))}
        {facilities.length === 0 && <p className="text-sm text-slate-400">No facilities yet — add your first one.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Facility">
        <div className="space-y-4">
          <Field label="Facility Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Default Deduction Percentage" hint="Auto-applied to new cases at this facility">
            <Input type="number" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
