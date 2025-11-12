import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Result from './pages/Result.tsx'
import Programme from './pages/Programme.tsx'
import Home from './pages/Home.tsx'
import Warmup from './pages/q/Warmup.tsx'
import Daily from './pages/q/Daily.tsx'
import Nearby from './pages/q/Nearby.tsx'
import Blueprint from './pages/q/Blueprint.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/q/warmup" element={<Warmup />} />
        <Route path="/q/daily" element={<Daily />} />
        <Route path="/q/nearby" element={<Nearby />} />
        <Route path="/q/blueprint" element={<Blueprint />} />
        <Route path="/result" element={<Result />} />
        <Route path="/programme" element={<Programme />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
