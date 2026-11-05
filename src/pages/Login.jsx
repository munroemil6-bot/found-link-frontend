import { Navigate, useLocation } from 'react-router-dom'
import EmailPasswordForm from '../components/EmailPasswordForm'
import GoogleLoginButton from '../components/GoogleLoginButton'

function Login({ user, isLoading, authError }) {
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-600" role="status">
        Checking your sign-in…
      </main>
    )
  }

  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_50%_0%,#e2eee0_0%,transparent_55%),#f7f8f5] p-6">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-emerald-950/5 sm:p-12"
      >
        <p className="mb-5 text-sm font-bold uppercase tracking-widest text-emerald-800">
          Found-Link Kenya
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" id="login-title">
          Welcome back
        </h1>
        <p className="mb-6 mt-3 leading-6 text-slate-600">
          Sign in to continue to your Found Link Kenya account.
        </p>
        {location.state?.message && (
          <p className="mb-4 text-left text-sm leading-6 text-emerald-800" role="status">
            {location.state.message}
          </p>
        )}
        {authError && (
          <p className="mb-4 text-left text-sm leading-6 text-red-700" role="alert">
            {authError}
          </p>
        )}
        <GoogleLoginButton />
        <div className="my-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <EmailPasswordForm />
      </section>
    </main>
  )
}

export default Login
