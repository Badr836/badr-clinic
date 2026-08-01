import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface DashboardData {
  casesToday: number
  casesThisMonth: number
  revenueThisMonth: number
  pendingPayments: number
  highRiskCases: number
  incompleteCases: number
  revenueByFacility: { name: string; revenue: number }[]
  casesByAsa: { asa: string; count: number }[]
  casesByProcedure: { procedure: string; count: number }[]
}

const EMPTY: DashboardData = {
  casesToday: 0,
  casesThisMonth: 0,
  revenueThisMonth: 0,
  pendingPayments: 0,
  highRiskCases: 0,
  incompleteCases: 0,
  revenueByFacility: [],
  casesByAsa: [],
  casesByProcedure: [],
}

export function useDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const [statsRes, revByFacilityRes, byAsaRes, byProcRes, pendingRes, revMonthRes] = await Promise.all([
        supabase.from('v_dashboard_stats').select('*').maybeSingle(),
        supabase.from('v_revenue_by_facility').select('facility_name, total_revenue').order('total_revenue', { ascending: false }),
        supabase.from('v_cases_by_asa').select('asa, case_count'),
        supabase.from('v_cases_by_procedure').select('procedure_name, case_count').order('case_count', { ascending: false }).limit(8),
        supabase.from('case_revenue').select('final_revenue, amount_paid').neq('payment_status', 'paid'),
        supabase
          .from('cases')
          .select('revenue, case_date')
          .gte('case_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)),
      ])

      if (cancelled) return

      const pendingPayments = (pendingRes.data ?? []).reduce(
        (sum: number, r: { final_revenue: number; amount_paid: number }) => sum + (r.final_revenue - r.amount_paid),
        0
      )
      const revenueThisMonth = (revMonthRes.data ?? []).reduce(
        (sum: number, r: { revenue: number | null }) => sum + (r.revenue ?? 0),
        0
      )

      setData({
        casesToday: statsRes.data?.cases_today ?? 0,
        casesThisMonth: statsRes.data?.cases_this_month ?? 0,
        revenueThisMonth,
        pendingPayments,
        highRiskCases: statsRes.data?.high_risk_cases ?? 0,
        incompleteCases: statsRes.data?.incomplete_cases ?? 0,
        revenueByFacility: (revByFacilityRes.data ?? []).map((r: { facility_name: string | null; total_revenue: number }) => ({
          name: r.facility_name ?? 'Unassigned',
          revenue: r.total_revenue ?? 0,
        })),
        casesByAsa: (byAsaRes.data ?? []).map((r: { asa: string; case_count: number }) => ({
          asa: r.asa,
          count: r.case_count,
        })),
        casesByProcedure: (byProcRes.data ?? []).map((r: { procedure_name: string; case_count: number }) => ({
          procedure: r.procedure_name,
          count: r.case_count,
        })),
      })
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  return { data, loading }
}
