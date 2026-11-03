import { Navigate, Outlet, useLocation } from 'react-router-dom'

function ProtectedRoute({ user, isLoading }) {
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-600" role="status">
        Checking your sign-in…
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
