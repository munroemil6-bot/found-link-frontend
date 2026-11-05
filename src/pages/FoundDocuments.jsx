import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../lib/api'

const PAGE_SIZE = 20

function getDocumentPage(data) {
  if (Array.isArray(data)) {
    return { documents: data, nextOffset: null }
  }
  if (!Array.isArray(data?.results)) {
    throw new Error('The documents API returned an unexpected response.')
  }
  return {
    documents: data.results,
    nextOffset: data.next ? data.results.length : null,
  }
}

function FoundDocuments() {
  const location = useLocation()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [nextOffset, setNextOffset] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDocuments() {
      setLoading(true)
      setError('')
      setDocuments([])
      setNextOffset(null)

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: '0',
        })
        if (search.trim()) {
          params.set('search', search.trim())
        }
        const data = await apiRequest(`/api/documents/?${params}`, {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          const page = getDocumentPage(data)
          setDocuments(page.documents)
          setNextOffset(
            page.nextOffset === null ? null : page.documents.length,
          )
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error('Could not load documents:', requestError)
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

    const timer = setTimeout(loadDocuments, search.trim() ? 250 : 0)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [retryKey, search])

  async function handleLoadMore() {
    if (nextOffset === null || loadingMore) {
      return
    }

    setLoadingMore(true)
    setError('')
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(nextOffset),
      })
      if (search.trim()) {
        params.set('search', search.trim())
      }
      const data = await apiRequest(`/api/documents/?${params}`)
      const page = getDocumentPage(data)
      setDocuments((currentDocuments) => [
        ...currentDocuments,
        ...page.documents,
      ])
      setNextOffset(
        page.nextOffset === null
          ? null
          : nextOffset + page.documents.length,
      )
    } catch (requestError) {
      console.error('Could not load more documents:', requestError)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load more documents.',
      )
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMoreDocuments = nextOffset !== null

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
        <div className="mt-6 flex flex-col gap-3 rounded-lg bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p>Could not load documents: {error}</p>
          <button
            className="w-fit font-semibold underline"
            onClick={() => setRetryKey((key) => key + 1)}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <h2 className="font-semibold text-slate-800">No documents found</h2>
          <p className="mt-2 text-sm text-slate-500">
            {search
              ? 'Try another search.'
              : 'No documents have been registered yet.'}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2" aria-busy={loading}>
        {documents.map((document) => (
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

      {hasMoreDocuments && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            className="min-h-11 rounded-lg border border-emerald-700 px-5 py-2 font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
            disabled={loadingMore}
            onClick={handleLoadMore}
            type="button"
          >
            {loadingMore ? 'Loading…' : 'Load more documents'}
          </button>
        </div>
      )}
    </section>
  )
}

export default FoundDocuments
