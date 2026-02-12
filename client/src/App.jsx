import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CreateProfile from './pages/CreateProfile'
import Home from './pages/Home'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Search from './pages/Search'
import Notifications from './pages/Notifications'
import Admin from './pages/Admin'
import Messages from './pages/Messages'
import Explore from './pages/Explore'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-profile" element={
              <ProtectedRoute>
                <CreateProfile />
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute requireProfile={true}>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId?" element={
              <ProtectedRoute requireProfile={true}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute requireProfile={true}>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute requireProfile={true}>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute requireProfile={true}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/messages/:userId?" element={
              <ProtectedRoute requireProfile={true}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/explore" element={
              <ProtectedRoute requireProfile={true}>
                <Explore />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
