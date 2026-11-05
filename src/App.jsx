import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { auth } from './lib/firebase'
import { apiRequest } from './lib/api'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DocumentDetails = lazy(() => import('./pages/DocumentDetails'))
const FoundDocuments = lazy(() => import('./pages/FoundDocuments'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PickupPoints = lazy(() => import('./pages/PickupPoints'))
const RegisterDocument = lazy(() => import('./pages/RegisterDocument'))
const SearchDocuments = lazy(() => import('./pages/SearchDocuments'))
const LostReports = lazy(() => import('./pages/LostReports'))
const ReportLostDocument = lazy(() => import('./pages/ReportLostDocument'))
const LostReportDetails = lazy(() => import('./pages/LostReportDetails'))
const Matches = lazy(() => import('./pages/Matches'))
const Handovers = lazy(() => import('./pages/Handovers'))

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const authErrorRef = useRef('')
  const activeRef = useRef(false)
  const authChangeRef = useRef(0)

  useEffect(() => {
    activeRef.current = true
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        const change = ++authChangeRef.current
        if (!currentUser) {
          setUser(null)
          setAuthError(authErrorRef.current)
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        if (!currentUser.emailVerified) {
          authErrorRef.current = 'Verify your email address before continuing.'
          setUser(null)
          setAuthError(authErrorRef.current)
          setIsLoading(false)
          signOut(auth).catch((error) => {
            console.error('Could not sign out an unverified Firebase user:', error)
          })
          return
        }

        authErrorRef.current = ''
        setAuthError('')

        async function syncProfile() {
          try {
            await apiRequest('/api/auth/profile/')
            if (activeRef.current && change === authChangeRef.current) {
              setUser(currentUser)
            }
          } catch (error) {
            if (!activeRef.current || change !== authChangeRef.current) {
              return
            }
            console.error('Could not save the Firebase profile to the backend:', error)
            const detail = error instanceof Error ? ` ${error.message}` : ''
            authErrorRef.current =
              `Signed in with Firebase, but could not save your profile to the application database.${detail}`
            setUser(null)
            setAuthError(authErrorRef.current)
            await signOut(auth).catch((signOutError) => {
              console.error('Could not sign out after profile synchronization failed:', signOutError)
            })
          } finally {
            if (activeRef.current && change === authChangeRef.current) {
              setIsLoading(false)
            }
          }
        }

        syncProfile()
      },
      (error) => {
        console.error('Firebase auth state failed:', error)
        authErrorRef.current =
          'Could not restore your sign-in state. Sign in again to continue.'
        setUser(null)
        setAuthError(authErrorRef.current)
        setIsLoading(false)
      },
    )
    return () => {
      activeRef.current = false
      unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <main className="grid min-h-screen place-items-center text-slate-600" role="status">
            Loading page…
          </main>
        }
      >
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
              <Route path="lost-reports" element={<LostReports />} />
              <Route path="lost-reports/new" element={<ReportLostDocument />} />
              <Route path="lost-reports/:id" element={<LostReportDetails />} />
              <Route path="matches" element={<Matches />} />
              <Route path="handovers" element={<Handovers />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
