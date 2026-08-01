import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Case } from '@/types/database'

export function useCases(filters?: { incompleteOnly?: boolean; highRiskOnly?: boolean }) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('cases')
      .select('*, facility:facilities(id, name)')
      .order('case_date', { ascending: false })

    if (filters?.incompleteOnly) query = query.lt('completion_score', 100)
    if (filters?.highRiskOnly) query = query.eq('is_high_risk', true)

    const { data, error: err } = await query
    if (err) setError(err.message)
    else setCases((data ?? []) as unknown as Case[])
    setLoading(false)
  }, [filters?.incompleteOnly, filters?.highRiskOnly])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { cases, loading, error, refresh }
}

export async function upsertCase(payload: Partial<Case> & { owner_id: string }) {
  const { data, error } = await supabase.from('cases').upsert(payload).select().single()
  if (error) throw error
  return data as Case
}

export async function deleteCase(id: string) {
  const { error } = await supabase.from('cases').delete().eq('id', id)
  if (error) throw error
}
