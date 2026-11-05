import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function getDocuments(data) {
  const documents = Array.isArray(data) ? data : data?.results
  if (!Array.isArray(documents)) {
    throw new Error('The documents API returned an unexpected response.')
  }
  return documents
}

function FoundDocuments() {
  const location = useLocation()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadDocuments() {
      try {
        const data = await apiRequest('/api/documents/', {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setDocuments(getDocuments(data))
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not load documents.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDocuments()
    return () => controller.abort()
  }, [])

  const filteredDocuments = useMemo(() => {
    const searchText = search.trim().toLowerCase()
    if (!searchText) {
      return documents
    }

    return documents.filter((document) =>
      [
        document.document_type,
        document.discovery_location,
        document.reference_code,
        document.pickup_point_name,
      ].some((value) => value?.toLowerCase().includes(searchText)),
    )
  }, [documents, search])

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Records</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Found Documents</h1>
          <p className="mt-2 text-slate-600">
            View and search documents registered in Found-Link Kenya.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          to="/documents/new"
        >
          Register a document
        </Link>
      </div>

      {location.state?.registered && (
        <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          Document registered successfully.
          {location.state.referenceCode && (
            <span className="ml-1 font-semibold">
              Reference: {location.state.referenceCode}
            </span>
          )}
        </div>
      )}

      <div className="mt-6">
        <label className="sr-only" htmlFor="document-search">
          Search documents
        </label>
        <input
          className="min-h-12 w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-emerald-600"
          id="document-search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by type, location, reference, or pickup point…"
          type="search"
          value={search}
        />
      </div>

      {loading && (
        <p className="mt-6 text-slate-600" role="status">
          Loading documents…
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700" role="alert">
          Could not load documents: {error}
        </p>
      )}

      {!loading && !error && filteredDocuments.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <h2 className="font-semibold text-slate-800">No documents found</h2>
          <p className="mt-2 text-sm text-slate-500">
            {search
              ? 'Try another search.'
              : 'No documents have been registered yet.'}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredDocuments.map((document) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            key={document.id}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold capitalize text-slate-900">
                {document.document_type.replaceAll('_', ' ')}
              </h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                {document.status.replaceAll('_', ' ')}
              </span>
            </div>

            <dl className="mt-4 space-y-2 text-sm text-slate-600">
              <div>
                <dt className="inline font-semibold">Reference: </dt>
                <dd className="inline break-all">{document.reference_code}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Location: </dt>
                <dd className="inline">{document.discovery_location}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Date found: </dt>
                <dd className="inline">{document.date_found}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Pickup point: </dt>
                <dd className="inline">
                  {document.pickup_point_name || 'Not assigned'}
                </dd>
              </div>
            </dl>

            <Link
              className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
              to={`/documents/${document.id}`}
            >
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FoundDocuments
