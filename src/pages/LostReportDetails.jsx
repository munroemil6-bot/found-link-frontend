import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function LostReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadReport() {
    const data = await apiRequest(`/api/lost-reports/${id}/`)
    setReport(data)
  }

  useEffect(() => {
    let active = true
    Promise.all([
      apiRequest(`/api/lost-reports/${id}/`),
      apiRequest('/api/matches/'),
    ]).then(([reportData, matchData]) => {
      if (active) {
        setReport(reportData)
        const all = Array.isArray(matchData) ? matchData : matchData.results || []
        setMatches(all.filter((item) => String(item.lost_report) === String(id)))
      }
    }).catch((err) => { if (active) setError(err.message || 'Could not load report.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  async function generateMatches() {
    setWorking(true); setError(''); setMessage('')
    try {
      const result = await apiRequest(`/api/lost-reports/${id}/find-matches/`, { method: 'POST' })
      setMatches(result.matches || [])
      await loadReport()
      setMessage(`${result.count || 0} possible match(es) found. An officer must verify every match.`)
    } catch (err) { setError(err.message || 'Could not generate matches.') }
    finally { setWorking(false) }
  }

  if (loading) return <p role="status">Loading report…</p>
  if (error && !report) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
  if (!report) return <p>Report not found.</p>

  return (
    <section className="space-y-6">
      <Link to="/lost-reports" className="text-sm font-semibold text-emerald-800 underline">← Back to reports</Link>
      <header>
        <p className="text-sm font-medium text-emerald-700">Lost report #{report.id}</p>
        <h1 className="mt-1 text-3xl font-bold capitalize">{report.document_type.replaceAll('_', ' ')}</h1>
        <p className="mt-2 text-slate-600">Lost at {report.loss_location} on {report.date_lost}</p>
        <p className="mt-2 text-sm capitalize text-slate-600">Status: {report.status}</p>
      </header>
      {report.description && <p className="rounded-lg border bg-white p-4">{report.description}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{message}</p>}
      <button onClick={generateMatches} disabled={working} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{working ? 'Searching…' : 'Find possible matches'}</button>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Possible matches</h2>
        {matches.length === 0 && <p className="rounded-xl border border-dashed p-6 text-slate-600">No possible matches are currently listed. Try searching again later.</p>}
        {matches.map((match) => (
          <article key={match.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold capitalize">{match.found_document_type?.replaceAll('_', ' ')}</h3>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-900">{match.score}% similarity</span>
            </div>
            <dl className="mt-3 space-y-1 text-sm text-slate-600">
              <div>Reference: {match.found_document_reference}</div>
              <div>Found at: {match.found_document_location}</div>
              <div>Pickup point: {match.pickup_point_name}</div>
              <div>Status: <span className="capitalize">{match.status}</span></div>
            </dl>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">{(match.reasons || []).map((reason, index) => <li key={index}>{reason}</li>)}</ul>
          </article>
        ))}
      </div>
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Similarity scores are only suggestions. They do not confirm that a document belongs to the person who reported it lost. Verification must be completed by an authorised officer.</p>
    </section>
  )
}
export default LostReportDetails
