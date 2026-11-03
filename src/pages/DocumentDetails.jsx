import { useParams } from 'react-router-dom'

function DocumentDetails() {
  const { id } = useParams()

  return (
    <section>
      <p className="text-sm font-medium text-emerald-700">Record</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Document details</h1>
      <p className="mt-3 text-slate-600">Document #{id} details are coming in a later step.</p>
    </section>
  )
}

export default DocumentDetails
