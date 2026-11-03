import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { auth } from './lib/firebase'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import DocumentDetails from './pages/DocumentDetails'
import FoundDocuments from './pages/FoundDocuments'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PickupPoints from './pages/PickupPoints'
import RegisterDocument from './pages/RegisterDocument'
import SearchDocuments from './pages/SearchDocuments'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setAuthError('')
        setIsLoading(false)
      },
      (error) => {
        console.error('Firebase auth state failed:', error)
        setUser(null)
        setAuthError('Could not restore your sign-in state. Sign in again to continue.')
        setIsLoading(false)
      },
    )
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login user={user} isLoading={isLoading} authError={authError} />}
        />
        <Route element={<ProtectedRoute user={user} isLoading={isLoading} />}>
          <Route
            element={
              <DashboardLayout
                user={user}
                onLogout={() => signOut(auth)}
              />
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
