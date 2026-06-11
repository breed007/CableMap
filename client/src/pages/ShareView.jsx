import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import DeviceTypeIcon from '../components/DeviceTypeIcon'
import { DEVICE_TYPE_LABELS, CABLE_COLORS, CABLE_TYPE_LABELS, STATUS_DISPLAY } from '../utils/cableColors'

export default function ShareView() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/${token}/snapshot`)
      if (!res.ok) { setError('This share link is invalid or has been revoked.'); return }
      setData(await res.json())
      setUpdatedAt(new Date())
    } catch { setError('Could not load the shared view.') }
  }, [token])

  useEffect(() => {
    load()
    const t = setInterval(load, 30000) // live-ish refresh
    return () => clearInterval(t)
  }, [load])

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center"><div className="text-3xl mb-3">🔒</div><p className="text-sm text-gray-400">{error}</p></div>
    </div>
  )
  if (!data) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-sm text-[#06B6D4] animate-pulse">Loading…</div>

  const locMap = {}; data.locations.forEach(l => { locMap[l.id] = l })
  const byLoc = {}
  data.devices.forEach(d => { const k = d.location_id || 'none'; (byLoc[k] ||= []).push(d) })
  const groups = Object.keys(byLoc).sort((a, b) => (locMap[a]?.name || 'zzz').localeCompare(locMap[b]?.name || 'zzz'))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="3" cy="10" r="2" fill="#06B6D4"/><circle cx="17" cy="10" r="2" fill="#06B6D4"/><circle cx="10" cy="5" r="2" fill="#06B6D4"/><line x1="5" y1="10" x2="8" y2="6" stroke="#06B6D4" strokeWidth="1.5"/><line x1="12" y1="6" x2="15" y2="10" stroke="#06B6D4" strokeWidth="1.5"/></svg>
            <div>
              <h1 className="text-lg font-semibold text-white">{data.label || 'CableMap'} <span className="text-xs text-gray-600 font-normal ml-1">read-only</span></h1>
              <p className="text-xs text-gray-600">{data.devices.length} devices · {data.connections.length} connections{updatedAt ? ` · updated ${updatedAt.toLocaleTimeString()}` : ''}</p>
            </div>
          </div>
          {data.monitored > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }}/>{data.online} up</span>
              {data.offline > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }}/>{data.offline} down</span>}
            </div>
          )}
        </div>

        {/* Devices grouped by location */}
        <div className="space-y-5 mb-8">
          {groups.map(k => (
            <div key={k}>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                {locMap[k]?.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: locMap[k].color }}/>}
                {locMap[k]?.name || 'Unassigned'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {byLoc[k].map(d => {
                  const st = d.monitor_enabled ? (STATUS_DISPLAY[d.last_status] || STATUS_DISPLAY.unknown) : null
                  return (
                    <div key={d.id} className="bg-[#141414] border border-[#1f2937] rounded-lg p-3"
                      style={st ? { borderLeft: `3px solid ${st.color}` } : undefined}>
                      <div className="flex items-center gap-2">
                        <DeviceTypeIcon type={d.device_type} size={13} className="text-[#06B6D4] shrink-0"/>
                        <span className="text-sm text-white font-medium truncate">{d.name}</span>
                        {st && <span className="ml-auto w-2 h-2 rounded-full shrink-0" title={st.label} style={{ backgroundColor: st.color }}/>}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{DEVICE_TYPE_LABELS[d.device_type] || d.device_type}</div>
                      {d.management_ip && <div className="text-xs text-gray-500 font-mono mt-0.5">{d.management_ip}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Connections */}
        {data.connections.length > 0 && (
          <div className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1f2937] text-sm font-semibold text-white">Connections</div>
            <div className="divide-y divide-[#1f2937]">
              {data.connections.map(c => (
                <div key={c.id} className="px-4 py-2 flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CABLE_COLORS[c.cable_type] || '#6B7280' }}/>
                  <span className="text-white truncate">{c.device_a_name}</span>
                  <span className="text-gray-600 font-mono text-xs">{c.port_a_label}</span>
                  <span className="text-gray-700">→</span>
                  <span className="text-white truncate">{c.device_b_name}</span>
                  <span className="text-gray-600 font-mono text-xs">{c.port_b_label}</span>
                  <span className="ml-auto text-xs text-gray-600">{CABLE_TYPE_LABELS[c.cable_type]}{c.vlan_name ? ` · VLAN ${c.vlan_number}` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-700 mt-8">Shared from CableMap · read-only</div>
      </div>
    </div>
  )
}
