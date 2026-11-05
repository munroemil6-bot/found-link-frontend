import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function DocumentDetails() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchDocument() {
      setLoading(true)
      setError('')
      setDocument(null)

      try {
        const data = await apiRequest(`/api/documents/${id}/`, {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setDocument(data)
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error('Could not load document details:', requestError)
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load document details.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchDocument()
    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <p className="p-6 text-slate-600" role="status">
        Loading document details…
      </p>
    )
  }

  if (error) {
    return (
      <section className="space-y-4 p-6">
        <p className="rounded-lg bg-red-50 p-4 text-red-700" role="alert">
          Could not load document details: {error}
        </p>
        <Link
          className="font-semibold text-emerald-800 underline-offset-4 hover:underline"
          to="/documents"
        >
          Back to Found Documents
        </Link>
      </section>
    )
  }

  if (!document) {
    return (
      <section className="space-y-4 p-6">
        <p className="text-slate-600">Document not found.</p>
        <Link
          className="font-semibold text-emerald-800 underline-offset-4 hover:underline"
          to="/documents"
        >
          Back to Found Documents
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link
        className="inline-block text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
        to="/documents"
      >
        ← Back to Found Documents
      </Link>

      <header>
        <p className="text-sm font-medium text-emerald-700">Document Details</p>
        <h1 className="mt-1 text-3xl font-bold capitalize text-slate-900">
          {document.document_type?.replaceAll('_', ' ') || 'Document'}
        </h1>
        <p className="mt-2 break-all text-sm text-slate-500">
          Reference: {document.reference_code || 'Not available'}
        </p>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm text-slate-500">Discovery Location</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {document.discovery_location || 'Not specified'}
          </dd>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm text-slate-500">Date Found</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {document.date_found || 'Not specified'}
          </dd>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm text-slate-500">Pickup Point</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {document.pickup_point_name || 'Not specified'}
          </dd>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="text-sm text-slate-500">Current Status</dt>
          <dd className="mt-1 font-medium capitalize text-slate-900">
            {document.status?.replaceAll('_', ' ') || 'Not specified'}
          </dd>
        </div>
      </dl>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Record Information</h2>
        <dl className="mt-3 space-y-2 text-sm text-slate-600">
          <div>
            <dt className="inline font-medium">Record ID: </dt>
            <dd className="inline">{document.id}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Created: </dt>
            <dd className="inline">
              {document.created_at
                ? new Date(document.created_at).toLocaleString()
                : 'Not available'}
            </dd>
          </div>
        </dl>
      </section>
    </section>
  )
}

export default DocumentDetails
