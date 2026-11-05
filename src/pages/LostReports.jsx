import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function LostReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    apiRequest('/api/lost-reports/', { signal: controller.signal })
      .then((data) => setReports(Array.isArray(data) ? data : data.results || []))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || 'Could not load reports.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Recovery</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Lost Document Reports</h1>
          <p className="mt-2 text-slate-600">Reports submitted by signed-in users.</p>
        </div>
        <Link to="/lost-reports/new" className="rounded-lg bg-emerald-700 px-4 py-3 text-center font-semibold text-white">Report a lost document</Link>
      </header>
      {loading && <p role="status">Loading reports…</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && !error && reports.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-slate-600">No lost-document reports have been submitted.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <article key={report.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold capitalize">{report.document_type.replaceAll('_', ' ')}</h2>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs capitalize text-amber-800">{report.status}</span>
            </div>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div><dt className="inline font-semibold">Lost at: </dt><dd className="inline">{report.loss_location}</dd></div>
              <div><dt className="inline font-semibold">Date lost: </dt><dd className="inline">{report.date_lost}</dd></div>
              {report.description && <div><dt className="inline font-semibold">Description: </dt><dd className="inline">{report.description}</dd></div>}
            </dl>
            <Link to={`/lost-reports/${report.id}`} className="mt-4 inline-block font-semibold text-emerald-800 underline">View report and matches</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
export default LostReports
