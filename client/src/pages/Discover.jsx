import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { DEVICE_TYPE_LABELS } from '../utils/cableColors'

const DEVICE_TYPES = ['switch','patch_panel','wall_plate','router','nas','access_point','server','firewall','modem','media_converter','ups','pdu','shelf','blank','other']

// Best-effort device type guess from the OUI vendor.
function guessType(vendor) {
  if (!vendor) return 'other'
  const v = vendor.toLowerCase()
  if (v.includes('synology') || v.includes('qnap')) return 'nas'
  if (v.includes('fortinet') || v.includes('palo alto')) return 'firewall'
  if (v.includes('apc')) return 'ups'
  if (v.includes('vmware')) return 'server'
  if (v.includes('raspberry') || v.includes('intel') || v.includes('dell') || v.includes('hp')) return 'server'
  return 'other'
}

export default function Discover() {
  const navigate = useNavigate()
  const [cidr, setCidr] = useState('192.168.1.0/24')
  const [scanning, setScanning] = useState(false)
  const [found, setFound] = useState(null)
  const [pending, setPending] = useState([])
  const [locations, setLocations] = useState([])
  const [rows, setRows] = useState({}) // per-id { name, device_type }
  const [monitorOnImport, setMonitorOnImport] = useState(true)
  const [error, setError] = useState('')

  const loadPending = () => api.get('/discovery').then(r => {
    setPending(r.data)
    setRows(prev => {
      const next = { ...prev }
      r.data.forEach(d => { if (!next[d.id]) next[d.id] = { name: d.hostname || d.ip, device_type: guessType(d.vendor) } })
      return next
    })
  })

  useEffect(() => {
    loadPending()
    api.get('/locations').then(r => setLocations(r.data))
  }, [])

  const scan = async () => {
    setScanning(true); setError(''); setFound(null)
    try {
      const res = await api.post('/discovery/scan', { cidr })
      setFound(res.data.found)
      await loadPending()
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed')
    } finally { setScanning(false) }
  }

  const importHost = async (d) => {
    const row = rows[d.id] || {}
    await api.post(`/discovery/${d.id}/import`, {
      name: row.name, device_type: row.device_type, monitor_enabled: monitorOnImport,
    })
    loadPending()
  }
  const ignore = async (d) => { await api.post(`/discovery/${d.id}/ignore`); loadPending() }

  const setRow = (id, patch) => setRows(r => ({ ...r, [id]: { ...r[id], ...patch } }))

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Discover Devices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sweep a subnet and import what you find. A documentation aid — it pings hosts, it doesn't port-scan.</p>
        </div>
        <button onClick={() => navigate('/devices')} className="text-sm text-gray-400 hover:text-white">← Devices</button>
      </div>

      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4 mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Subnet (CIDR, /24–/30)</label>
          <input value={cidr} onChange={e => setCidr(e.target.value)}
            className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white font-mono w-48 focus:outline-none focus:border-[#06B6D4]" placeholder="192.168.1.0/24"/>
        </div>
        <button onClick={scan} disabled={scanning}
          className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
          {scanning ? 'Scanning…' : 'Scan'}
        </button>
        <label className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
          <input type="checkbox" checked={monitorOnImport} onChange={e => setMonitorOnImport(e.target.checked)} className="rounded"/>
          Enable monitoring on import
        </label>
      </div>

      {error && <div className="text-sm text-red-400 mb-4 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</div>}
      {found != null && <div className="text-xs text-gray-500 mb-3">Last scan found {found} responding host{found !== 1 ? 's' : ''}. New ones appear below.</div>}

      {scanning && <div className="text-sm text-gray-600 animate-pulse mb-3">Pinging hosts… this can take a few seconds.</div>}

      {pending.length === 0 ? (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg px-4 py-10 text-center text-sm text-gray-600">
          No pending discoveries. Run a scan to find devices on your network.
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f2937] text-sm font-semibold text-white">Pending ({pending.length})</div>
          <div className="divide-y divide-[#1f2937]">
            {pending.map(d => (
              <div key={d.id} className="px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
                <div className="min-w-[160px]">
                  <div className="font-mono text-white">{d.ip}</div>
                  <div className="text-xs text-gray-600">{d.hostname || '—'}{d.mac ? ` · ${d.mac}` : ''}</div>
                </div>
                <div className="text-xs text-gray-400 min-w-[90px]">{d.vendor || 'Unknown vendor'}</div>
                <input value={rows[d.id]?.name || ''} onChange={e => setRow(d.id, { name: e.target.value })}
                  className="bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-white w-40" placeholder="name"/>
                <select value={rows[d.id]?.device_type || 'other'} onChange={e => setRow(d.id, { device_type: e.target.value })}
                  className="bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300">
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{DEVICE_TYPE_LABELS[t]}</option>)}
                </select>
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => importHost(d)} className="text-xs px-3 py-1.5 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded">Import</button>
                  <button onClick={() => ignore(d)} className="text-xs px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-400 rounded">Ignore</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
