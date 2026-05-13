import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LeagueProvider } from './context/LeagueContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LeagueProvider>
       <App />
      </LeagueProvider>
    </AuthProvider>
  </StrictMode>,
)
