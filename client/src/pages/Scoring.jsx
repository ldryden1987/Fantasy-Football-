import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMatchups, generateMatchups, updateScores, completeWeek } from '../services/matchupService'
import { useAuth } from '../context/AuthContext'
import { useLeague } from '../context/LeagueContext'
import Navbar from '../components/Navbar'

const Scoring = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { activeLeague } = useLeague()
  const [matchups, setMatchups] = useState([])
  const [week, setWeek] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isCommissioner, setIsCommissioner] = useState(false)

  useEffect(() => {
    if (activeLeague) {
      setIsCommissioner(
        activeLeague.commissioner?._id === user._id ||
        activeLeague.commissioner === user._id
      )
    }
  }, [activeLeague, user])

  useEffect(() => {
    fetchMatchups()
  }, [week, id])

  const fetchMatchups = async () => {
    setLoading(true)
    try {
      const res = await getMatchups(id, week)
      setMatchups(res.data)
    } catch (err) {
      console.error('Error fetching matchups:', err)
      setMatchups([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      await generateMatchups(id, week)
      await fetchMatchups()
    } catch (err) {
      console.error('Error generating matchups:', err)
    }
  }

  const handleUpdateScores = async () => {
    try {
      await updateScores(id, week)
      await fetchMatchups()
    } catch (err) {
      console.error('Error updating scores:', err)
    }
  }

  const handleCompleteWeek = async () => {
    try {
      await completeWeek(id, week)
      await fetchMatchups()
    } catch (err) {
      console.error('Error completing week:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">📺 Live Scoring</h2>
            <p className="text-gray-400 mt-1">Weekly matchups and scores</p>
          </div>
          <Link
            to={`/league/${id}/standings`}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            📊 Standings
          </Link>
        </div>

        {/* Week Selector */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setWeek(w => Math.max(1, w - 1))}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ←
          </button>
          <span className="text-xl font-bold">Week {week}</span>
          <button
            onClick={() => setWeek(w => Math.min(18, w + 1))}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* Commissioner Controls */}
        {isCommissioner && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">⚙️ Commissioner Controls</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleGenerate}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                🎲 Generate Matchups
              </button>
              <button
                onClick={handleUpdateScores}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                🔄 Update Scores
              </button>
              <button
                onClick={handleCompleteWeek}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                ✅ Complete Week
              </button>
            </div>
          </div>
        )}

        {/* Matchups */}
        {loading ? (
          <p className="text-gray-400">Loading matchups...</p>
        ) : matchups.length === 0 ? (
          <div className="bg-gray-800 border border-dashed border-gray-700 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No matchups for Week {week}</p>
            {isCommissioner && (
              <p className="text-gray-500 text-sm">Click "Generate Matchups" to create this week's schedule</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {matchups.map((matchup) => (
              <div key={matchup._id} className="bg-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    matchup.status === 'live' ? 'bg-green-500/20 text-green-400' :
                    matchup.status === 'completed' ? 'bg-gray-600 text-gray-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {matchup.status === 'live' ? '🔴 LIVE' :
                     matchup.status === 'completed' ? '✅ Final' : '📅 Scheduled'}
                  </span>
                  <span className="text-gray-500 text-xs">Week {week}</span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  {/* Home Team */}
                  <div className="flex-1 text-center">
                    <p className={`text-lg font-bold ${
                      matchup.status === 'completed' && matchup.winner?._id === matchup.homeTeam._id
                        ? 'text-green-400' : 'text-white'
                    }`}>
                      {matchup.homeTeam?.name}
                    </p>
                    <p className="text-gray-400 text-sm">{matchup.homeTeam?.owner?.username}</p>
                    <p className="text-4xl font-bold mt-2 text-green-400">
                      {matchup.homeScore.toFixed(1)}
                    </p>
                  </div>

                  {/* VS */}
                  <div className="px-6 text-gray-500 font-bold text-xl">VS</div>

                  {/* Away Team */}
                  <div className="flex-1 text-center">
                    <p className={`text-lg font-bold ${
                      matchup.status === 'completed' && matchup.winner?._id === matchup.awayTeam._id
                        ? 'text-green-400' : 'text-white'
                    }`}>
                      {matchup.awayTeam?.name}
                    </p>
                    <p className="text-gray-400 text-sm">{matchup.awayTeam?.owner?.username}</p>
                    <p className="text-4xl font-bold mt-2 text-green-400">
                      {matchup.awayScore.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Scoring
