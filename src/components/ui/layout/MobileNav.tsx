import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Users, Wallet, FlaskConical } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/cases', label: 'Cases', icon: ClipboardList },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/revenue', label: 'Revenue', icon: Wallet },
  { to: '/research', label: 'Research', icon: FlaskConical },
]

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-brand-900/90 lg:hidden">
      <div className="grid grid-cols-5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
                isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
              )
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
