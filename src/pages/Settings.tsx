import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Button from '@/components/ui/Button'

export default function Settings() {
  const { profile, user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="label-eyebrow">Account</p>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex items-center gap-3">
          {profile?.avatar_url && <img src={profile.avatar_url} className="h-12 w-12 rounded-full" alt="" />}
          <div>
            <p className="font-medium">{profile?.full_name ?? user?.email}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-4">
        <p className="font-display text-base font-semibold">Appearance</p>
        <div className="flex gap-2">
          <Button variant={theme === 'light' ? 'primary' : 'secondary'} size="sm" onClick={() => setTheme('light')}>Light</Button>
          <Button variant={theme === 'dark' ? 'primary' : 'secondary'} size="sm" onClick={() => setTheme('dark')}>Dark</Button>
        </div>
      </div>

      <Button variant="danger" onClick={() => signOut()}>Sign out</Button>
    </div>
  )
}
