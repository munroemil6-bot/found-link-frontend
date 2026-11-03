import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8">
      <p className="text-sm font-medium text-emerald-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
      <Link className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline" to="/">
        Return to dashboard
      </Link>
    </section>
  )
}

export default NotFound
