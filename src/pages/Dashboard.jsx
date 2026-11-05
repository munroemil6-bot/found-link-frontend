import { useEffect, useState } from 'react'
import {
  CheckCircle,
  ClipboardList,
  Clock3,
  FileText,
  GitCompareArrows,
  MapPin,
  Package,
  Plus,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { apiRequest } from '../lib/api'

const pageLinks = [
  { to: '/documents', label: 'Found Documents', description: 'Browse recovered documents.', icon: FileText },
  { to: '/documents/new', label: 'Register a Document', description: 'Add a newly found document.', icon: Plus },
  { to: '/search', label: 'Find a Document', description: 'Search for a document.', icon: Search },
  { to: '/pickup-points', label: 'Pickup Points', description: 'Find document collection locations.', icon: MapPin },
  { to: '/lost-reports', label: 'Lost Reports', description: 'View submitted lost-document reports.', icon: ClipboardList },
  { to: '/lost-reports/new', label: 'Report a Lost Document', description: 'Submit a lost-document report.', icon: Plus },
  { to: '/matches', label: 'Potential Matches', description: 'Review possible document matches.', icon: GitCompareArrows },
  { to: '/handovers', label: 'Handovers', description: 'Record and review document returns.', icon: CheckCircle },
]

const statDefinitions = [
  { label: 'Documents Found', key: 'found', icon: FileText },
  { label: 'Awaiting Collection', key: 'awaiting', icon: Clock3 },
  { label: 'Documents Returned', key: 'returned', icon: CheckCircle },
  { label: 'Total Records', key: 'total', icon: Package },
]

const emptyCounts = { found: 0, awaiting: 0, returned: 0, total: 0 }

function getSummary(data) {
  if (
    !data
    || !data.counts
    || !Array.isArray(data.recent_documents)
    || !statDefinitions.every(({ key }) => Number.isInteger(data.counts[key]))
  ) {
    throw new Error('The document summary API returned an unexpected response.')
  }
  return data
}

function Dashboard() {
  const [summary, setSummary] = useState({
    counts: emptyCounts,
    recent_documents: [],
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDocuments() {
      setIsLoading(true)
      setError('')

      try {
        const response = await apiRequest('/api/documents/summary/', {
          signal: controller.signal,
        })
        const data = getSummary(response)
        if (!controller.signal.aborted) {
          setSummary(data)
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error('Could not load documents:', requestError)
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not load documents. Please try again.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadDocuments()
    return () => controller.abort()
  }, [reloadKey])

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-emerald-700">Overview</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Monitor found documents and their recovery progress.
        </p>
      </header>

      {error && (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>Could not load records: {error}</p>
          <button
            className="w-fit rounded-md border border-red-300 px-3 py-1.5 font-semibold hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            onClick={() => setReloadKey((key) => key + 1)}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      <section
        aria-label="Document statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statDefinitions.map(({ label, key, icon }) => (
          <StatCard
            key={key}
            label={label}
            value={summary.counts[key]}
            icon={icon}
            isLoading={isLoading}
          />
        ))}
      </section>

      <section aria-labelledby="page-links-heading">
        <h2 id="page-links-heading" className="text-lg font-semibold text-slate-900">
          Go to a page
        </h2>
        <nav
          aria-label="Application pages"
          className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {pageLinks.map(({ to, label, description, icon: Icon }) => (
            <Link
              key={to}
              className="group flex min-h-28 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              to={to}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-800">
                <Icon aria-hidden="true" size={20} />
              </span>
              <span>
                <span className="block font-semibold text-slate-900 group-hover:text-emerald-800">
                  {label}
                </span>
                <span className="mt-1 block text-sm text-slate-600">{description}</span>
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Documents</h2>
            <p className="mt-1 text-sm text-slate-500">Latest registered records</p>
          </div>
          <Link
            className="text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
            to="/documents"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-5 text-sm text-slate-500" role="status">
            Loading records…
          </p>
        ) : summary.recent_documents.length === 0 && !error ? (
          <p className="mt-5 text-sm text-slate-500">
            No documents have been registered yet.
          </p>
        ) : (
          summary.recent_documents.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Document Type</th>
                    <th className="py-3 pr-4 font-medium">Location</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Date Found</th>
                    <th className="py-3 font-medium">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_documents.map((document) => (
                    <tr key={document.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pr-4 capitalize text-slate-800">
                        {document.document_type.replaceAll('_', ' ')}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {document.discovery_location}
                      </td>
                      <td className="py-4 pr-4 capitalize text-slate-600">
                        {document.status.replaceAll('_', ' ')}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">{document.date_found}</td>
                      <td className="py-4 text-right">
                        <Link
                          className="font-semibold text-emerald-800 hover:underline"
                          to={`/documents/${document.id}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>
    </div>
  )
}

export default Dashboard
