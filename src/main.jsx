import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'

const esDashboard = window.location.hash === '#dashboard'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {esDashboard ? <Dashboard /> : <App />}
  </StrictMode>,
)