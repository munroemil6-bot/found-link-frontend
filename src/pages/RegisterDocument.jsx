import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'

const initialForm = {
  document_type: 'national_id',
  discovery_location: '',
  date_found: '',
  pickup_point: '',
}

function getRecords(data, resourceName) {
  const records = Array.isArray(data) ? data : data?.results
  if (!Array.isArray(records)) {
    throw new Error(`The ${resourceName} API returned an unexpected response.`)
  }
  return records
}

function getLocalDate() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

function RegisterDocument() {
  const navigate = useNavigate()
  const [pickupPoints, setPickupPoints] = useState([])
  const [loadingPoints, setLoadingPoints] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPickupPoints() {
      try {
        const data = await apiRequest('/api/pickup-points/', {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setPickupPoints(getRecords(data, 'Pickup points'))
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
          setLoadingPoints(false)
        }
      }
    }

    loadPickupPoints()
    return () => controller.abort()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const document = await apiRequest('/api/documents/', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          pickup_point: Number(form.pickup_point),
        }),
      })

      navigate('/documents', {
        state: {
          registered: true,
          referenceCode: document.reference_code,
        },
      })
    } catch (requestError) {
      console.error('Could not register document:', requestError)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not register the document. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const hasActivePickupPoints = pickupPoints.some((point) => point.is_active)

  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-sm font-medium text-emerald-700">Records</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">
        Register a Found Document
      </h1>
      <p className="mt-2 text-slate-600">
        Record a document that has been handed in or recovered.
      </p>

      <form
        className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        onSubmit={handleSubmit}
      >
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="document-type"
          >
            Document type
          </label>
          <select
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-emerald-600"
            id="document-type"
            name="document_type"
            onChange={handleChange}
            required
            value={form.document_type}
          >
            <option value="national_id">National ID</option>
            <option value="passport">Passport</option>
            <option value="certificate">Certificate</option>
            <option value="driving_license">Driving Licence</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="discovery-location"
          >
            Discovery location
          </label>
          <input
            className="min-h-12 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-emerald-600"
            id="discovery-location"
            maxLength={200}
            name="discovery_location"
            onChange={handleChange}
            placeholder="e.g. Nairobi CBD"
            required
            type="text"
            value={form.discovery_location}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="date-found"
          >
            Date found
          </label>
          <input
            className="min-h-12 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-emerald-600"
            id="date-found"
            max={getLocalDate()}
            name="date_found"
            onChange={handleChange}
            required
            type="date"
            value={form.date_found}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="pickup-point"
          >
            Pickup point
          </label>
          <select
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-emerald-600 disabled:bg-slate-100"
            disabled={loadingPoints || !hasActivePickupPoints}
            id="pickup-point"
            name="pickup_point"
            onChange={handleChange}
            required
            value={form.pickup_point}
          >
            <option value="">
              {loadingPoints ? 'Loading pickup points…' : 'Select a pickup point'}
            </option>
            {pickupPoints
              .filter((point) => point.is_active)
              .map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name} - {point.area}
                </option>
              ))}
          </select>
          {!loadingPoints && !error && !hasActivePickupPoints && (
            <p className="mt-2 text-sm text-amber-700">
              No active pickup points are available.{' '}
              <Link className="underline" to="/pickup-points">
                View pickup points
              </Link>
            </p>
          )}
        </div>

        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          Image uploads are not available yet. This form saves the document
          information only.
        </p>

        <button
          className="min-h-12 w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting || loadingPoints || !hasActivePickupPoints}
          type="submit"
        >
          {submitting ? 'Registering…' : 'Register Document'}
        </button>
      </form>
    </section>
  )
}

export default RegisterDocument
