import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import 'leaflet/dist/leaflet.css'
import MyReservations from './pages/MyReservations'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/reservations" element={<MyReservations />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App