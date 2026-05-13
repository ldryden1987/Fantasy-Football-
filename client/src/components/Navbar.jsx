import { useAuth } from "../context/AuthContext";
import { useLeague } from "../context/LeagueContext";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
    const {user, logout } = useAuth()
    const { activeLeague } = useLeague()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-2xl font-bold text-green-400">
            🏈 Fantasy Football
          </Link>
          {activeLeague && (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to={`/league/${activeLeague._id}`}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                🏟️ League
              </Link>
              <Link
                to={`/league/${activeLeague._id}/roster`}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                📋 Roster
              </Link>
              <Link
                to={`/league/${activeLeague._id}/players`}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                🏈 Players
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden md:block">
            {user?.teamName || user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
    )
}

export default Navbar