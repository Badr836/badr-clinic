import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Facility } from '@/types/database'

export function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('facilities').select('*').order('name')
    setFacilities((data ?? []) as Facility[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { facilities, loading, refresh }
}
