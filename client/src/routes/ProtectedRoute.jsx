import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
