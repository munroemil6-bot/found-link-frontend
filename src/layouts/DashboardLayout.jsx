import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

function DashboardLayout({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar onLogout={onLogout} />
      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Navbar user={user} />
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
