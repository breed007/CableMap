import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { CABLE_COLORS, STATUS_COLORS } from '../utils/cableColors'

function StatCard({ label, value, sub, color = '#06B6D4' }) {
  return (
    <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4">
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/summary').then(r => { setSummary(r.data); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return }
    const timer = setTimeout(() => {
      api.get(`/search?q=${encodeURIComponent(search)}`).then(r => setSearchResults(r.data))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  if (loading) return (
    <div className="p-8 text-gray-500 text-sm">Loading dashboard...</div>
  )

  const { total_devices, total_ports, total_connections, unconnected_port_count, recent_connections, alerts, total_racks = 0, total_photos = 0, monitored_devices = 0, devices_online = 0, devices_offline = 0 } = summary

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Your homelab, cable by cable</p>
      </div>

      {/* Quick search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <input
          type="text"
          placeholder="Quick search devices, ports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-[#1e1e1e] border border-[#374151] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#06B6D4] transition-colors"
        />
        {searchResults && search && (
          <div className="absolute top-full left-0 mt-1 w-full max-w-md bg-[#1e1e1e] border border-[#374151] rounded-lg shadow-xl z-20 max-h-72 overflow-y-auto">
            {searchResults.devices.length === 0 && searchResults.ports.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No results</div>
            ) : (
              <>
                {searchResults.devices.slice(0, 5).map(d => (
                  <Link key={d.id} to={`/devices/${d.id}`} onClick={() => setSearch('')}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#374151] transition-colors">
                    <span className="text-xs text-[#06B6D4] w-14 shrink-0">Device</span>
                    <span className="text-sm text-white">{d.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{d.location_name}</span>
                  </Link>
                ))}
                {searchResults.ports.slice(0, 5).map(p => (
                  <Link key={p.id} to={`/devices/${p.device_id}`} onClick={() => setSearch('')}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#374151] transition-colors">
                    <span className="text-xs text-gray-400 w-14 shrink-0">Port</span>
                    <span className="text-sm text-white font-mono">{p.label}</span>
                    <span className="text-xs text-gray-500 ml-auto">{p.device_name}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Devices" value={total_devices} color="#06B6D4"/>
        <StatCard label="Connections" value={total_connections} color="#22C55E"/>
        <StatCard label="Total Ports" value={total_ports} color="#8B5CF6"/>
        <StatCard label="Unconnected" value={unconnected_port_count} color={unconnected_port_count > 0 ? '#6B7280' : '#22C55E'}/>
        <StatCard label="Racks" value={total_racks} color="#3B82F6"/>
        {monitored_devices > 0 ? (
          <StatCard label="Online" value={`${devices_online}/${monitored_devices}`} sub={devices_offline > 0 ? `${devices_offline} offline` : 'all up'} color={devices_offline > 0 ? '#EF4444' : '#22C55E'}/>
        ) : (
          <StatCard label="Photos" value={total_photos} color="#EC4899"/>
        )}
      </div>

      {/* Alerts */}
      {(alerts.devices_no_ports.length > 0 || alerts.planned_connections > 0) && (
        <div className="mb-6 space-y-2">
          {alerts.planned_connections > 0 && (
            <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg px-4 py-2.5 text-sm text-amber-300">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1z" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="5" x2="7" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="10" r="0.6" fill="currentColor"/></svg>
              {alerts.planned_connections} planned connection{alerts.planned_connections > 1 ? 's' : ''} not yet active
            </div>
          )}
          {alerts.devices_no_ports.length > 0 && (
            <div className="flex items-start gap-2 bg-[#374151]/30 border border-[#374151] rounded-lg px-4 py-2.5 text-sm text-gray-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="4" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="9.5" r="0.6" fill="currentColor"/></svg>
              <span>
                {alerts.devices_no_ports.length} device{alerts.devices_no_ports.length > 1 ? 's' : ''} with no ports: {alerts.devices_no_ports.map(d => d.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg">
        <div className="px-4 py-3 border-b border-[#1f2937]">
          <h2 className="text-sm font-semibold text-white">Recent Connections</h2>
        </div>
        {recent_connections.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-600">No connections yet. <Link to="/connections" className="text-[#06B6D4] hover:underline">Add one</Link></div>
        ) : (
          <div className="divide-y divide-[#1f2937]">
            {recent_connections.map(c => (
              <div key={c.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CABLE_COLORS[c.cable_type] || '#6B7280' }} />
                <span className="text-white font-medium truncate">{c.device_a_name}</span>
                <span className="text-gray-500 font-mono text-xs">{c.port_a_label}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-600 shrink-0"><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2"/><path d="M8 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span className="text-white font-medium truncate">{c.device_b_name}</span>
                <span className="text-gray-500 font-mono text-xs">{c.port_b_label}</span>
                <span className="ml-auto text-xs shrink-0 px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: STATUS_COLORS[c.status] + '33', color: STATUS_COLORS[c.status] }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
