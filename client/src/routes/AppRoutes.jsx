import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import CreateLeague from '../pages/CreateLeague'
import JoinLeague from '../pages/JoinLeague'
import LeagueHome from '../pages/LeagueHome'
import Roster from '../pages/Roster'
import Players from '../pages/Players'
import DraftRoom from '../pages/DraftRoom'
import Scoring from '../pages/Scoring'
import Standings from '../pages/Standings'
import ProtectedRoute from './ProtectedRoute'

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/league/create" element={<ProtectedRoute><CreateLeague /></ProtectedRoute>} />
      <Route path="/league/join" element={<ProtectedRoute><JoinLeague /></ProtectedRoute>} />
      <Route path="/league/:id" element={<ProtectedRoute><LeagueHome /></ProtectedRoute>} />
      <Route path="/league/:id/roster" element={<ProtectedRoute><Roster /></ProtectedRoute>} />
      <Route path="/league/:id/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
      <Route path="/league/:id/draft" element={<ProtectedRoute><DraftRoom /></ProtectedRoute>} />
      <Route path="/league/:id/scoring" element={<ProtectedRoute><Scoring /></ProtectedRoute>} />
      <Route path="/league/:id/standings" element={<ProtectedRoute><Standings /></ProtectedRoute>} />
    </Routes>
  )
}

export default AppRoutes
