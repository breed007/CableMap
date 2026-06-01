import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'
import Connections from './pages/Connections'
import Canvas from './pages/Canvas'
import Racks from './pages/Racks'
import Gallery from './pages/Gallery'
import Templates from './pages/Templates'
import VlanManager from './pages/VlanManager'
import Search from './pages/Search'
import Import from './pages/Import'
import Export from './pages/Export'
import api from './utils/api'

function RequireAuth({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get('/auth/me').then(r => {
      setStatus(r.data.authenticated ? 'ok' : 'unauth')
    }).catch(() => setStatus('unauth'))
  }, [])

  if (status === 'loading') return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-[#06B6D4] text-sm animate-pulse">Loading...</div>
    </div>
  )
  if (status === 'unauth') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<Devices />} />
          <Route path="devices/:id" element={<DeviceDetail />} />
          <Route path="connections" element={<Connections />} />
          <Route path="canvas" element={<Canvas />} />
          <Route path="racks" element={<Racks />} />
          <Route path="templates" element={<Templates />} />
          <Route path="photos" element={<Gallery />} />
          <Route path="vlans" element={<VlanManager />} />
          <Route path="search" element={<Search />} />
          <Route path="import" element={<Import />} />
          <Route path="export" element={<Export />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
