import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

export async function apiRequest(endpoint, options = {}) {
  if (!API_URL) {
    throw new Error('Set VITE_API_URL in .env.local before making API requests.')
  }
  if (!endpoint.startsWith('/')) {
    throw new Error('API endpoints must start with "/".')
  }

  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('Please sign in first.')
  }

  const idToken = await currentUser.getIdToken()
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${idToken}`)

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorMessage = await response.text()
    throw new Error(errorMessage || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
