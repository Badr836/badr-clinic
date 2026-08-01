import { Link } from 'react-router-dom'
import { CalendarDays, CalendarRange, Wallet, Clock3, AlertTriangle, FileWarning } from 'lucide-react'
import Stat from '@/components/ui/Stat'
import RevenueByFacilityChart from '@/components/charts/RevenueByFacilityChart'
import CasesByAsaChart from '@/components/charts/CasesByAsaChart'
import CasesByProcedureChart from '@/components/charts/CasesByProcedureChart'
import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/format'

export default function Dashboard() {
  const { data, loading } = useDashboard()

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Overview</p>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Cases Today" value={loading ? '—' : data.casesToday} icon={<CalendarDays size={18} />} />
        <Stat label="Cases This Month" value={loading ? '—' : data.casesThisMonth} icon={<CalendarRange size={18} />} />
        <Stat label="Revenue This Month" value={loading ? '—' : formatCurrency(data.revenueThisMonth)} icon={<Wallet size={18} />} />
        <Stat label="Pending Payments" value={loading ? '—' : formatCurrency(data.pendingPayments)} icon={<Clock3 size={18} />} tone="warning" />
        <Stat label="High Risk Cases" value={loading ? '—' : data.highRiskCases} icon={<AlertTriangle size={18} />} tone="danger" />
        <Stat label="Incomplete Cases" value={loading ? '—' : data.incompleteCases} icon={<FileWarning size={18} />} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-2 font-display text-base font-semibold">Revenue by Facility</h2>
          <RevenueByFacilityChart data={data.revenueByFacility} />
        </div>
        <div className="card p-4">
          <h2 className="mb-2 font-display text-base font-semibold">Cases by ASA</h2>
          <CasesByAsaChart data={data.casesByAsa} />
        </div>
        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-2 font-display text-base font-semibold">Cases by Procedure</h2>
          <CasesByProcedureChart data={data.casesByProcedure} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/cases?quick=1" className="card px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5">
          + Quick Entry Case
        </Link>
        <Link to="/cases?filter=incomplete" className="card px-4 py-3 text-sm font-medium text-clinical-amber hover:bg-amber-50 dark:hover:bg-white/5">
          Review Incomplete Cases
        </Link>
      </div>
    </div>
  )
}
