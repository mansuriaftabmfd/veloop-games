import { Navigate, Route, Routes } from 'react-router-dom'
import GamesPage from './pages/GamesPage.jsx'
import GameHomePage from './pages/GameHomePage.jsx'
import GamePlayPage from './pages/GamePlayPage.jsx'
import RedeemPage from './pages/RedeemPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/games" replace />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/:slug" element={<GameHomePage />} />
      <Route path="/games/:slug/play" element={<GamePlayPage />} />
      <Route path="/games/redeem" element={<Navigate to="/redeem" replace />} />
      <Route path="/redeem" element={<RedeemPage />} />
      <Route path="*" element={<Navigate to="/games" replace />} />
    </Routes>
  )
}
