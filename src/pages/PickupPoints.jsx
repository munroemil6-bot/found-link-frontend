import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

function getPickupPoints(data) {
  const points = Array.isArray(data) ? data : data?.results
  if (!Array.isArray(points)) {
    throw new Error('The pickup points API returned an unexpected response.')
  }
  return points
}

function PickupPoints() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadPoints() {
      try {
        const data = await apiRequest('/api/pickup-points/', {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setPoints(getPickupPoints(data))
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not load pickup points.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadPoints()
    return () => controller.abort()
  }, [])

  return (
    <section>
      <p className="text-sm font-medium text-emerald-700">Locations</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Pickup Points</h1>
      <p className="mt-2 text-slate-600">
        Find locations where recovered documents are held.
      </p>

      {loading && (
        <p className="mt-6 text-slate-600" role="status">
          Loading pickup points…
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700" role="alert">
          Could not load pickup points: {error}
        </p>
      )}
      {!loading && !error && points.length === 0 && (
        <p className="mt-6 rounded-lg bg-slate-50 p-5 text-slate-600">
          No pickup points have been registered yet.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {points.map((point) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            key={point.id}
          >
            <h2 className="text-lg font-semibold text-slate-900">{point.name}</h2>
            <p className="mt-1 text-sm text-emerald-700">{point.area}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>{point.address || 'Address not provided'}</p>
              <p>Contact: {point.contact || 'Not provided'}</p>
              <p>Opening hours: {point.opening_hours || 'Not provided'}</p>
            </div>
            <span
              className={`mt-4 inline-block rounded-full px-3 py-1 text-xs ${
                point.is_active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {point.is_active ? 'Active' : 'Inactive'}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PickupPoints
