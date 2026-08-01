import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Patient } from '@/types/database'

export function usePatients(search?: string) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('patients').select('*').order('full_name').limit(200)
    if (search && search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,file_number.ilike.%${search}%`)
    }
    const { data } = await query
    setPatients((data ?? []) as Patient[])
    setLoading(false)
  }, [search])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { patients, loading, refresh }
}
