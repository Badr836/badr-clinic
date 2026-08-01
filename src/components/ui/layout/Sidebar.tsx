import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Users, Wallet, Building2, FlaskConical, Settings as SettingsIcon, Stethoscope,
} from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/cases', label: 'Cases', icon: ClipboardList },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/revenue', label: 'Revenue', icon: Wallet },
  { to: '/facilities', label: 'Facilities', icon: Building2 },
  { to: '/research', label: 'Research', icon: FlaskConical },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-white/10 dark:bg-brand-900/40 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
          <Stethoscope size={18} />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-tight">Badr Clinic</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Anesthesia Practice</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      <p className="px-2 text-[11px] text-slate-400 dark:text-slate-500">v1.0 · Private practice edition</p>
    </aside>
  )
}
