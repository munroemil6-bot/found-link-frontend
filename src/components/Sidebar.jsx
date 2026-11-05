import { useState } from 'react'
import { FileText, LayoutDashboard, LogOut, MapPin, Search, ClipboardList, GitCompareArrows, CheckCircle2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/documents', label: 'Found Documents', mobileLabel: 'Found', icon: FileText },
  { to: '/search', label: 'Find a Document', mobileLabel: 'Search', icon: Search },
  { to: '/pickup-points', label: 'Pickup Points', mobileLabel: 'Locations', icon: MapPin },
  { to: '/lost-reports', label: 'Lost Reports', mobileLabel: 'Lost', icon: ClipboardList },
  { to: '/matches', label: 'Potential Matches', mobileLabel: 'Matches', icon: GitCompareArrows },
  { to: '/handovers', label: 'Handovers', mobileLabel: 'Returns', icon: CheckCircle2 },
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

  const logoutButton = (mobile = false) => (
    <button
      className={
        mobile
          ? 'flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60 lg:hidden'
          : 'hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60 lg:flex'
      }
      disabled={isSigningOut}
      onClick={handleLogout}
      type="button"
    >
      <LogOut aria-hidden="true" size={18} />
      <span>{isSigningOut ? 'Signing out…' : 'Sign out'}</span>
    </button>
  )

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-50 flex w-full shrink-0 flex-col border-t border-slate-200 bg-white/95 p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:static lg:min-h-screen lg:w-64 lg:border-r lg:border-t-0 lg:p-5 lg:shadow-none lg:backdrop-blur-none"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mb-5 hidden items-center gap-3 lg:mb-10 lg:flex">
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
        className="grid grid-cols-3 gap-1 lg:flex lg:flex-1 lg:flex-col lg:gap-2"
      >
        {links.map(({ to, label, mobileLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${to === '/' || to === '/search' ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium leading-tight transition lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon aria-hidden="true" size={18} />
            <span className="truncate lg:hidden">{mobileLabel}</span>
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
        {logoutButton(true)}
        {logoutError && (
          <p className="col-span-4 px-2 text-center text-xs text-red-700 lg:hidden" role="alert">
            {logoutError}
          </p>
        )}
      </nav>

      <div className="mt-4 hidden lg:mt-auto lg:block lg:pt-8">
        {logoutButton()}
        {logoutError && <p className="mt-2 px-3 text-sm text-red-700" role="alert">{logoutError}</p>}
      </div>
    </aside>
  )
}

export default Sidebar
