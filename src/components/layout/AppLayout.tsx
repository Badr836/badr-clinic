import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-950">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <Topbar />
          <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
