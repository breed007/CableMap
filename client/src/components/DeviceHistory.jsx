import { useEffect, useState } from 'react'
import api from '../utils/api'
import { HISTORY_ACTION_COLORS } from '../utils/cableColors'

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

export default function DeviceHistory({ deviceId, refreshKey }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get(`/history/device/${deviceId}`).then(r => setEvents(r.data))
  }, [deviceId, refreshKey])

  if (events.length === 0) return null

  return (
    <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-4">
      <div className="px-4 py-3 border-b border-[#1f2937]">
        <h2 className="text-sm font-semibold text-white">History <span className="text-gray-500 font-normal">({events.length})</span></h2>
      </div>
      <div className="divide-y divide-[#1f2937] max-h-64 overflow-y-auto">
        {events.map(ev => (
          <div key={ev.id} className="px-4 py-2 flex items-start gap-2.5 text-sm">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: HISTORY_ACTION_COLORS[ev.action] || '#6B7280' }} />
            <span className="text-gray-300 flex-1">{ev.summary}</span>
            <span className="text-xs text-gray-600 shrink-0" title={ev.created_at}>{timeAgo(ev.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
