import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeague } from '../context/LeagueContext'
import { createLeague } from '../services/leagueService'
import Navbar from '../components/Navbar'

const CreateLeague = () => {
  const navigate = useNavigate()
  const { fetchLeagues } = useLeague()
  const [formData, setFormData] = useState({
    name: '',
    scoringType: 'ppr',
    maxTeams: 10
  })
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
      const res = await createLeague(formData)
      await fetchLeagues()
      navigate(`/league/${res.data.league._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create league')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">Create a League</h2>
        <p className="text-gray-400 mb-8">Set up your fantasy football league</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 rounded-2xl p-8">
          <div>
            <label className="block text-gray-400 text-sm mb-2">League Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Lamont's League"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Scoring Type</label>
            <select
              name="scoringType"
              value={formData.scoringType}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="ppr">PPR (Point Per Reception)</option>
              <option value="half-ppr">Half PPR</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Max Teams</label>
            <select
              name="maxTeams"
              value={formData.maxTeams}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            >
              {[6, 8, 10, 12, 14].map(n => (
                <option key={n} value={n}>{n} Teams</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create League'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateLeague
