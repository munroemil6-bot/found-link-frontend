import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState({})
  const [busyId, setBusyId] = useState(null)
  const [canReview, setCanReview] = useState(false)

  async function load() {
    const data = await apiRequest('/api/matches/')
    setMatches(Array.isArray(data) ? data : data.results || [])
  }
  useEffect(() => {
    Promise.all([load(), apiRequest('/api/auth/profile/')])
      .then(([, profile]) => setCanReview(['officer', 'admin'].includes(profile.role)))
      .catch((err) => setError(err.message || 'Could not load matches.'))
      .finally(() => setLoading(false))
  }, [])

  async function review(id, decision) {
    setBusyId(id); setError('')
    try {
      await apiRequest(`/api/matches/${id}/review/`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes: notes[id] || '' }),
      })
      await load()
    } catch (err) {
      setError(err.message || 'Review could not be saved. Officer or administrator access may be required.')
    } finally { setBusyId(null) }
  }

  return (
    <section className="space-y-6">
      <header><p className="text-sm font-medium text-emerald-700">Review queue</p><h1 className="mt-1 text-3xl font-bold">Potential Matches</h1><p className="mt-2 text-slate-600">Review possible matches generated from lost reports.</p></header>
      {loading && <p role="status">Loading matches…</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {!loading && matches.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-slate-600">No potential matches are available.</p>}
      {matches.map((match) => (
        <article key={match.id} className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">Match #{match.id} · {match.score}%</h2><span className="text-sm capitalize text-slate-600">{match.status}</span></div>
          <p className="text-sm text-slate-600">Lost report #{match.lost_report}: {match.lost_report_type} · {match.lost_report_location}</p>
          <p className="text-sm text-slate-600">Found record: {match.found_document_reference} · {match.found_document_location} · {match.pickup_point_name}</p>
          <ul className="list-disc pl-5 text-sm text-slate-600">{(match.reasons || []).map((reason, i) => <li key={i}>{reason}</li>)}</ul>
          {match.status === 'pending' && canReview && <>
            <label className="block text-sm font-medium">Officer review notes<textarea rows={2} maxLength={500} value={notes[match.id] || ''} onChange={(e) => setNotes((old) => ({ ...old, [match.id]: e.target.value }))} className="mt-1 w-full rounded-lg border p-3" /></label>
            <div className="flex flex-wrap gap-2">
              <button disabled={busyId === match.id} onClick={() => review(match.id, 'approved')} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Approve for collection</button>
              <button disabled={busyId === match.id} onClick={() => review(match.id, 'rejected')} className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">Reject match</button>
            </div>
          </>}
        </article>
      ))}
      {!canReview && <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">Match decisions are available to station officers and administrators.</p>}
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Only an officer or administrator can approve or reject matches. A similarity score is not proof of ownership; follow your organisation's in-person verification process.</p>
    </section>
  )
}
export default Matches
