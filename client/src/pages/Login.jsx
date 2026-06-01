import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/login', { username, password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="4" cy="16" r="3" fill="#06B6D4"/>
              <circle cx="28" cy="16" r="3" fill="#06B6D4"/>
              <circle cx="16" cy="6" r="3" fill="#06B6D4"/>
              <circle cx="16" cy="26" r="3" fill="#06B6D4"/>
              <line x1="7" y1="16" x2="13" y2="8" stroke="#06B6D4" strokeWidth="2"/>
              <line x1="19" y1="8" x2="25" y2="16" stroke="#06B6D4" strokeWidth="2"/>
              <line x1="7" y1="16" x2="25" y2="16" stroke="#374151" strokeWidth="1.5"/>
              <line x1="16" y1="9" x2="16" y2="23" stroke="#374151" strokeWidth="1.5"/>
            </svg>
            <span className="text-2xl font-bold text-white">CableMap</span>
          </div>
          <p className="text-sm text-gray-500">Physical network documentation</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141414] border border-[#1f2937] rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4] transition-colors"
              placeholder="admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4] transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium py-2 rounded transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
