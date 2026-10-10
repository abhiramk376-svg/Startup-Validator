import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import SignUp from './pages/SignUp.jsx'
import SignIn from './pages/SignIn.jsx'
import Chat from './pages/Chat.jsx'
import Results from './pages/Results.jsx'
import Reports from './pages/Reports.jsx'
import Profile from './pages/Profile.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      <Route path="/app" element={<RequireAuth><Chat /></RequireAuth>} />
      <Route path="/app/results/:validationId" element={<RequireAuth><Results /></RequireAuth>} />
      <Route path="/app/reports" element={<RequireAuth><Reports /></RequireAuth>} />
      <Route path="/app/profile" element={<RequireAuth><Profile /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}