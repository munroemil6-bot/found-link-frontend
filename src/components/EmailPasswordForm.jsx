import { useState } from 'react'
import { supabase } from '../lib/supabase'

function getAuthErrorMessage(error) {
  const message = error instanceof Error ? error.message : ''
  const code = error?.code

  if (code === 'user_already_exists') {
    return 'An account already exists for this email. Sign in instead.'
  }
  if (code === 'invalid_credentials' || code === 'invalid_grant') {
    return 'The email or password is incorrect.'
  }
  if (code === 'email_not_confirmed') {
    return 'Verify your email address before signing in.'
  }
  if (code === 'weak_password') {
    return 'Choose a stronger password.'
  }
  if (message.toLowerCase().includes('fetch')) {
    return 'Could not reach Supabase. Check your project URL and internet connection.'
  }
  return message || 'Authentication failed. Please try again.'
}

function EmailPasswordForm() {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (!supabase) {
      setErrorMessage('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
      return
    }

    setIsBusy(true)
    try {
      const normalizedEmail = email.trim()
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: new URL('/login', window.location.origin).toString(),
          },
        })
        if (error) {
          throw error
        }

        if (data.session && !data.user?.email_confirmed_at) {
          await supabase.auth.signOut()
        }
        setPassword('')
        setMessage(
          data.session && data.user?.email_confirmed_at
            ? 'Your account is ready.'
            : 'Account created. Check your email and verify your address before signing in.',
        )
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (error) {
        throw error
      }
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        setPassword('')
        setMessage('Verify your email address before signing in.')
      }
    } catch (error) {
      console.error('Supabase email authentication failed:', error)
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }

  const handlePasswordReset = async () => {
    setMessage('')
    setErrorMessage('')
    if (!email.trim()) {
      setErrorMessage('Enter your email address first, then choose Forgot password.')
      return
    }
    if (!supabase) {
      setErrorMessage('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
      return
    }

    setIsBusy(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: new URL('/reset-password', window.location.origin).toString(),
      })
      if (error) {
        throw error
      }
      setMessage('If an account exists for this email, a password reset link is on its way.')
    } catch (error) {
      console.error('Supabase password reset request failed:', error)
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }

  const isRegistering = mode === 'register'

  return (
    <div className="text-left">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
            Email address
          </label>
          <input
            autoComplete="email"
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
            id="password"
            minLength={6}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            required
            type="password"
            value={password}
          />
        </div>

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
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-70"
          disabled={isBusy}
          type="submit"
        >
          {isBusy
            ? 'Please wait…'
            : isRegistering
              ? 'Create account'
              : 'Sign in with email'}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        {!isRegistering && (
          <button
            className="font-medium text-emerald-800 underline-offset-4 hover:underline disabled:opacity-60"
            disabled={isBusy}
            onClick={handlePasswordReset}
            type="button"
          >
            Forgot password?
          </button>
        )}
        <button
          className="ml-auto font-medium text-emerald-800 underline-offset-4 hover:underline disabled:opacity-60"
          disabled={isBusy}
          onClick={() => {
            setMode(isRegistering ? 'sign-in' : 'register')
            setMessage('')
            setErrorMessage('')
          }}
          type="button"
        >
          {isRegistering ? 'Already have an account? Sign in' : 'Create an account'}
        </button>
      </div>
    </div>
  )
}

export default EmailPasswordForm
