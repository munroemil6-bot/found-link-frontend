import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

export async function apiRequest(endpoint, options = {}) {
  if (!API_URL) {
    throw new Error('Set VITE_API_URL in .env.local before making API requests.')
  }
  if (!endpoint.startsWith('/')) {
    throw new Error('API endpoints must start with "/".')
  }

  if (!supabase) {
    throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error(`Could not read the Supabase session: ${error.message}`)
  }
  if (!data.session) {
    throw new Error('Please sign in first.')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${data.session.access_token}`)

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
