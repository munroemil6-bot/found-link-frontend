import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

function Handovers() {
  const [handovers, setHandovers] = useState([])
  const [eligibleDocuments, setEligibleDocuments] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [canManage, setCanManage] = useState(false)

  async function load() {
    const [profile, documentData] = await Promise.all([
      apiRequest('/api/auth/profile/'),
      apiRequest('/api/documents/'),
    ])
    const staff = ['officer', 'admin'].includes(profile.role)
    setCanManage(staff)
    if (staff) {
      const handoverData = await apiRequest('/api/handovers/')
      setHandovers(Array.isArray(handoverData) ? handoverData : handoverData.results || [])
    } else {
      setHandovers([])
    }
    const docs = Array.isArray(documentData) ? documentData : documentData.results || []
    setEligibleDocuments(docs.filter((doc) => doc.status === 'awaiting_collection'))
  }

  useEffect(() => {
    load().catch((err) => setError(err.message || 'Could not load handovers.')).finally(() => setLoading(false))
  }, [])

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true); setError(''); setMessage('')
    try {
      await apiRequest('/api/handovers/', {
        method: 'POST',
        body: JSON.stringify({ document: Number(documentId), notes }),
      })
      setDocumentId(''); setNotes('')
      await load()
      setMessage('Handover recorded. The document status is now Returned.')
    } catch (err) {
      setError(err.message || 'Could not record handover. Officer or administrator access may be required.')
    } finally { setSubmitting(false) }
  }

  return (
    <section className="space-y-6">
      <header><p className="text-sm font-medium text-emerald-700">Collection records</p><h1 className="mt-1 text-3xl font-bold">Handovers</h1><p className="mt-2 text-slate-600">Record the return of an approved document.</p></header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{message}</p>}
      {canManage ? <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Record a completed handover</h2>
        <label className="block text-sm font-medium">Document awaiting collection
          <select required value={documentId} onChange={(e) => setDocumentId(e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border p-3">
            <option value="">Select a document</option>
            {eligibleDocuments.map((doc) => <option key={doc.id} value={doc.id}>{doc.reference_code} · {doc.document_type.replaceAll('_', ' ')} · {doc.discovery_location}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Handover notes (optional)
          <textarea rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 w-full rounded-lg border p-3" placeholder="Record that the organisation's identity verification process was completed. Avoid entering ID numbers." />
        </label>
        <button disabled={submitting || !eligibleDocuments.length} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{submitting ? 'Saving…' : 'Record handover'}</button>
        {!eligibleDocuments.length && <p className="text-sm text-slate-500">No documents are currently awaiting collection.</p>}
      </form> : <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">Handover records and collection actions are available to station officers and administrators.</p>}
      {canManage && <div className="space-y-3"><h2 className="text-xl font-bold">Handover history</h2>
        {loading && <p role="status">Loading handovers…</p>}
        {!loading && handovers.length === 0 && <p className="rounded-xl border border-dashed p-6 text-slate-600">No handovers recorded yet.</p>}
        {handovers.map((item) => <article key={item.id} className="rounded-xl border bg-white p-4"><p className="font-semibold">Reference: {item.document_reference_code}</p><p className="mt-1 text-sm text-slate-600">Returned: {new Date(item.date_returned).toLocaleString()}</p>{item.notes && <p className="mt-2 text-sm text-slate-600">{item.notes}</p>}</article>)}
      </div>}
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Use this workflow only after an authorised officer has completed the organisation's real-world ownership checks. This prototype does not itself verify identity.</p>
    </section>
  )
}
export default Handovers
