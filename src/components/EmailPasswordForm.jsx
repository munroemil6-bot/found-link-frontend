import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email. Sign in instead.'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.'
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled in Firebase Authentication.'
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not enabled for this project. Enable it in Firebase Console and turn on Email/Password.'
    case 'auth/unauthorized-domain':
      return 'This site is not authorized in Firebase. Add localhost under Authentication settings > Authorized domains.'
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your internet connection and try again.'
    default:
      return error instanceof Error ? error.message : 'Authentication failed. Please try again.'
  }
}

function EmailPasswordForm() {
  const [mode, setMode] = useState('sign-in')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')
    setErrorMessage('')

    try {
      const normalizedEmail = email.trim()
      if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        )
        await updateProfile(credential.user, { displayName: fullName.trim() })
        await sendEmailVerification(credential.user)
        await signOut(auth)
        setPassword('')
        setMessage('Account created. Verify your email, then sign in to save your profile to the application database.')
        return
      }

      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user)
        await signOut(auth)
        setPassword('')
        setMessage('Please verify your email before signing in. We sent you a new verification link.')
      }
    } catch (error) {
      console.error('Firebase email authentication failed:', error)
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }

  const handlePasswordReset = async () => {
    setIsBusy(true)
    setMessage('')
    setErrorMessage('')

    try {
      if (!email.trim()) {
        setErrorMessage('Enter your email address first, then choose Forgot password.')
        return
      }
      await sendPasswordResetEmail(auth, email.trim())
      setMessage('If an account exists for this email, a password reset link is on its way.')
    } catch (error) {
      console.error('Firebase password reset request failed:', error)
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }

  const isRegistering = mode === 'register'

  return (
    <div className="text-left">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {isRegistering && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="full-name">
              Full name
            </label>
            <input
              autoComplete="name"
              className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
              id="full-name"
              name="name"
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              required
              type="text"
              value={fullName}
            />
          </div>
        )}
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
