import { useState } from 'react'
import { FileText, LayoutDashboard, LogOut, MapPin, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/documents', label: 'Found Documents', icon: FileText },
  { to: '/search', label: 'Find a Document', icon: Search },
  { to: '/pickup-points', label: 'Pickup Points', icon: MapPin },
]

function Sidebar({ onLogout }) {
  const [logoutError, setLogoutError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    setIsSigningOut(true)
    setLogoutError('')

    try {
      await onLogout()
    } catch (error) {
      console.error('Sign out failed:', error)
      setLogoutError(
        error instanceof Error ? error.message : 'Could not sign out. Please try again.',
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white p-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-5">
      <div className="mb-5 flex items-center gap-3 lg:mb-10">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 font-bold text-white">
          F
        </div>
        <div>
          <p className="font-bold text-slate-900">Found-Link</p>
          <p className="text-xs text-slate-500">Kenya Document Recovery</p>
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex flex-wrap gap-1 lg:flex-1 lg:flex-col lg:gap-2"
      >
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon aria-hidden="true" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 lg:mt-auto lg:pt-8">
        <button
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60"
          disabled={isSigningOut}
          onClick={handleLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={18} />
          {isSigningOut ? 'Signing out…' : 'Sign out'}
        </button>
        {logoutError && (
          <p className="mt-2 px-3 text-sm text-red-700" role="alert">
            {logoutError}
          </p>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
