import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";


const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    //check if user is already logged in on app load
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            api.get('auth/me')
            .then((res) => setUser(res.data))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const register = async (formData) => {
        const res = await api.post('/auth/register', formData)
        localStorage.setItem('token', res.data.token)
        setUser(res.data)
    }
    const login = async (formData) => {
        const res = await api.post('/auth/login', formData)
        localStorage.setItem('token', res.data.token)
        setUser(res.data)
    }
    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }
    return (
        <AuthContext.Provider value={{user, loading, register, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)