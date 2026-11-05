import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function getLocalDate() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

function ReportLostDocument() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ document_type: 'national_id', loss_location: '', date_lost: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const report = await apiRequest('/api/lost-reports/', { method: 'POST', body: JSON.stringify(form) })
      navigate(`/lost-reports/${report.id}`)
    } catch (err) {
      setError(err.message || 'Could not submit the report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <Link to="/lost-reports" className="text-sm font-semibold text-emerald-800 underline">← Back to lost reports</Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Report a Lost Document</h1>
      <p className="mt-2 text-slate-600">Provide basic details to help locate a possible record.</p>
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-xl border bg-white p-5 shadow-sm">
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
        <label className="block text-sm font-medium">Document type
          <select name="document_type" value={form.document_type} onChange={update} className="mt-2 min-h-12 w-full rounded-lg border p-3">
            <option value="national_id">National ID</option><option value="passport">Passport</option><option value="certificate">Certificate</option><option value="driving_license">Driving Licence</option><option value="other">Other</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Approximate location where it was lost
          <input required maxLength={200} name="loss_location" value={form.loss_location} onChange={update} placeholder="e.g. Nairobi CBD" className="mt-2 min-h-12 w-full rounded-lg border p-3" />
        </label>
        <label className="block text-sm font-medium">Date lost
          <input required type="date" max={getLocalDate()} name="date_lost" value={form.date_lost} onChange={update} className="mt-2 min-h-12 w-full rounded-lg border p-3" />
        </label>
        <label className="block text-sm font-medium">Optional description
          <textarea maxLength={500} name="description" value={form.description} onChange={update} rows={3} placeholder="Add a non-sensitive description only." className="mt-2 w-full rounded-lg border p-3" />
        </label>
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Do not enter national ID numbers, passport numbers, passwords, or upload identity documents here. A possible match is not proof of ownership.</p>
        <button disabled={submitting} className="min-h-12 w-full rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit lost report'}</button>
      </form>
    </section>
  )
}
export default ReportLostDocument
