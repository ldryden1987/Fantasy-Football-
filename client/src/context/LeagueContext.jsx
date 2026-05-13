import { createContext, useContext, useState, useEffect, Children } from "react";
import { getMyLeagues } from "../services/leagueService";
import { useAuth} from './AuthContext'

const LeagueContext = createContext()

export const LeagueProvider = ({ children }) => {
    const { user } = useAuth()
    const [leagues, setLeagues] = useState([])
    const [activeLeague, setActiveLeague] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) fetchLeagues()
    }, [user])

    const fetchLeagues = async () => {
        setLoading(true)
        try {
           const res = await getMyLeagues()
           setLeagues(res.data)
           if (res.data.length > 0) setActiveLeague(res.data[0]) 
        } catch (err) {
            console.error('Error fetching leagues:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <LeagueContext.Provider value={{
            leagues,
            activeLeague,
            setActiveLeague,
            fetchLeagues,
            loading
         }}>
            {children}
        </LeagueContext.Provider>
    )
}

export const useLeague = () => useContext(LeagueContext)