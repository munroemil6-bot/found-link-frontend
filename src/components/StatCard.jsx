function StatCard({ label, value, icon: Icon, isLoading }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{label}</p>
        <Icon aria-hidden="true" className="text-emerald-700" size={20} />
      </div>
      <p className="mt-5 text-3xl font-bold text-slate-900" aria-live="polite">
        {isLoading ? '—' : value}
      </p>
    </article>
  )
}

export default StatCard
