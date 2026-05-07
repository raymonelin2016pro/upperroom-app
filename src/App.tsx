import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Feed from './pages/Feed'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import PostDetail from './pages/PostDetail'
import Icebreaker from './pages/Icebreaker'
import GameLobby from './pages/GameLobby'
import SpeedKing from './pages/SpeedKing'
import MemoryMatch from './pages/MemoryMatch'
import SpiritPersonalityTest from './pages/SpiritPersonalityTest'
import GraceDrift from './pages/GraceDrift'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import EventRegister from './pages/EventRegister'
import MyRegistrations from './pages/MyRegistrations'
import AdminEvents from './pages/admin/AdminEvents'
import AdminEventEditor from './pages/admin/AdminEventEditor'
import AdminEventRegistrations from './pages/admin/AdminEventRegistrations'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Feed />
              </PrivateRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <PrivateRoute>
                <PostDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/icebreaker"
            element={
              <PrivateRoute>
                <Icebreaker />
              </PrivateRoute>
            }
          />
          <Route
            path="/games"
            element={
              <PrivateRoute>
                <GameLobby />
              </PrivateRoute>
            }
          />
          <Route
            path="/speed-king"
            element={
              <PrivateRoute>
                <SpeedKing />
              </PrivateRoute>
            }
          />
          <Route
            path="/memory-match"
            element={
              <PrivateRoute>
                <MemoryMatch />
              </PrivateRoute>
            }
          />
          <Route
            path="/spirit-personality-test"
            element={
              <PrivateRoute>
                <SpiritPersonalityTest />
              </PrivateRoute>
            }
          />
          <Route
            path="/grace-drift"
            element={
              <PrivateRoute>
                <GraceDrift />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:slug"
            element={
              <PrivateRoute>
                <EventDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:slug/register"
            element={
              <PrivateRoute>
                <EventRegister />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <PrivateRoute>
                <MyRegistrations />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRoute>
                <AdminEvents />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <PrivateRoute>
                <AdminEventEditor />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/:eventId"
            element={
              <PrivateRoute>
                <AdminEventEditor />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/:eventId/registrations"
            element={
              <PrivateRoute>
                <AdminEventRegistrations />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
