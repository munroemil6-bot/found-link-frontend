import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import DocumentDetails from './pages/DocumentDetails'
import FoundDocuments from './pages/FoundDocuments'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PickupPoints from './pages/PickupPoints'
import RegisterDocument from './pages/RegisterDocument'
import ResetPassword from './pages/ResetPassword'
import SearchDocuments from './pages/SearchDocuments'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState(
    isSupabaseConfigured
      ? ''
      : 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
  )

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      if (currentUser && !currentUser.email_confirmed_at) {
        setUser(null)
        setAuthError('Verify your email address before continuing.')
      } else {
        setUser(currentUser)
        setAuthError('')
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login user={user} isLoading={isLoading} authError={authError} />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute user={user} isLoading={isLoading} />}>
          <Route
            element={
              <DashboardLayout user={user} onLogout={handleLogout} />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="documents" element={<FoundDocuments />} />
            <Route path="documents/new" element={<RegisterDocument />} />
            <Route path="documents/:id" element={<DocumentDetails />} />
            <Route path="search" element={<SearchDocuments />} />
            <Route path="pickup-points" element={<PickupPoints />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
