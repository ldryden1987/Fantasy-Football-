import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ email:'', password: ''})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(formData)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }
    return (
         <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400">🏈 Fantasy Football</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="lamont@example.com"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
    