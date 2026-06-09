import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LeagueProvider } from './context/LeagueContext.jsx'
import { DraftProvider } from './context/DraftContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LeagueProvider>
        <DraftProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </DraftProvider>
      </LeagueProvider>
    </AuthProvider>
  </StrictMode>
)
