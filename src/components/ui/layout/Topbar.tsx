import { Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export default function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const { profile, user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-brand-950/80 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</p>
        <p className="font-display text-lg font-semibold">{profile?.full_name ?? user?.email ?? 'Doctor'}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
            {(profile?.full_name ?? user?.email ?? 'D').charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={() => signOut()}
          aria-label="Sign out"
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:flex"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
