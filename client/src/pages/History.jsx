import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { HISTORY_ACTION_COLORS } from '../utils/cableColors'

const ENTITY_LABELS = {
  device: 'Device',
  connection: 'Connection',
  power_connection: 'Power',
  vlan: 'VLAN',
}

function timeAgo(iso) {
  if (!iso) return ''
  const then = new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z'))
  const s = Math.floor((Date.now() - then.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  return then.toLocaleDateString()
}

export default function History() {
  const [events, setEvents] = useState([])
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (entityType) params.set('entity_type', entityType)
    if (action) params.set('action', action)
    api.get(`/history?${params}`).then(r => { setEvents(r.data); setLoading(false) })
  }

  useEffect(() => { load() }, [entityType, action])

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">History</h1>
        <p className="text-sm text-gray-500 mt-0.5">Every change to devices, connections, and power — newest first</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={entityType} onChange={e => setEntityType(e.target.value)}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All types</option>
          <option value="device">Devices</option>
          <option value="connection">Connections</option>
          <option value="power_connection">Power</option>
        </select>
        <select value={action} onChange={e => setAction(e.target.value)}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="moved">Moved / re-patched</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600 animate-pulse">Loading…</div>
      ) : events.length === 0 ? (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg px-4 py-10 text-center text-sm text-gray-600">
          No history yet. Changes you make will show up here.
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg divide-y divide-[#1f2937]">
          {events.map(ev => {
            const color = HISTORY_ACTION_COLORS[ev.action] || '#6B7280'
            const deviceLink = ev.device_a_id || (ev.entity_type === 'device' ? ev.entity_id : null)
            return (
              <div key={ev.id} className="flex items-start gap-3 px-4 py-2.5">
                <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-200">{ev.summary}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase tracking-wide" style={{ color }}>{ev.action}</span>
                    <span className="text-[10px] text-gray-600">{ENTITY_LABELS[ev.entity_type] || ev.entity_type}</span>
                    {deviceLink && ev.action !== 'deleted' && (
                      <Link to={`/devices/${deviceLink}`} className="text-[10px] text-[#06B6D4] hover:underline">view device</Link>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 shrink-0" title={ev.created_at}>{timeAgo(ev.created_at)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
