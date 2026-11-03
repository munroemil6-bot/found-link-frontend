import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

function GoogleLoginButton() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleGoogleLogin = async () => {
    setIsSigningIn(true)
    setMessage('')
    setErrorMessage('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL

      if (!apiUrl) {
        throw new Error('Set VITE_API_URL in .env.local to connect to the backend.')
      }

      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const response = await fetch(
        `${apiUrl.replace(/\/+$/, '')}/api/auth/firebase/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        },
      )

      if (!response.ok) {
        throw new Error(`Backend authentication failed (HTTP ${response.status}).`)
      }

      setMessage('The backend responded successfully. A Django session is not established yet.')
    } catch (error) {
      console.error('Google login failed:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Google login failed. Please try again.',
      )
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="google-login">
      <button
        className="google-login__button"
        disabled={isSigningIn}
        onClick={handleGoogleLogin}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 48 48" className="google-login__icon">
          <path
            fill="#4285F4"
            d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
          />
          <path
            fill="#34A853"
            d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
          />
          <path
            fill="#FBBC05"
            d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z"
          />
          <path
            fill="#EA4335"
            d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
          />
        </svg>
        {isSigningIn ? 'Signing in…' : 'Continue with Google'}
      </button>
      {message && <p className="google-login__message">{message}</p>}
      {errorMessage && (
        <p className="google-login__message google-login__message--error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default GoogleLoginButton
