import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (!supabase) {
      setErrorMessage('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
      return
    }

    setIsSaving(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        throw sessionError
      }
      if (!sessionData.session) {
        throw new Error('Open the latest password reset link from your email to continue.')
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        throw error
      }
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw signOutError
      }
      navigate('/login', {
        replace: true,
        state: { message: 'Your password has been updated. Sign in with your new password.' },
      })
    } catch (error) {
      console.error('Supabase password update failed:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not update your password.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-emerald-950/5 sm:p-12">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-800">
          Found-Link Kenya
        </p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Choose a new password</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700" htmlFor="new-password">
            New password
          </label>
          <input
            autoComplete="new-password"
            className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
            id="new-password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {errorMessage && (
            <p className="text-sm leading-6 text-red-700" role="alert">
              {errorMessage}
            </p>
          )}
          {message && (
            <p className="text-sm leading-6 text-emerald-800" role="status">
              {message}
            </p>
          )}
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <Link className="mt-5 inline-block text-sm font-semibold text-emerald-800 underline" to="/login">
          Back to sign in
        </Link>
      </section>
    </main>
  )
}

export default ResetPassword
