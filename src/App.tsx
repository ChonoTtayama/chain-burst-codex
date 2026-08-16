import { Navigate, Route, Routes } from 'react-router-dom'
import { GamePage } from './pages/GamePage'
import { TitlePage } from './pages/TitlePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TitlePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
