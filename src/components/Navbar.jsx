function Navbar({ user }) {
  const displayName = user.displayName || user.email || 'Signed-in user'

  return (
    <header className="mb-8 flex min-h-12 items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">Found-Link Kenya</p>
        <p className="font-semibold text-slate-900">Document recovery workspace</p>
      </div>
      <div className="hidden max-w-64 items-center gap-3 sm:flex">
        {user.photoURL ? (
          <img
            alt=""
            className="size-9 rounded-full"
            referrerPolicy="no-referrer"
            src={user.photoURL}
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-800"
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="truncate text-sm font-medium text-slate-700">{displayName}</span>
      </div>
    </header>
  )
}

export default Navbar
