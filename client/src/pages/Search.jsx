import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import DeviceTypeIcon from '../components/DeviceTypeIcon'
import { DEVICE_TYPE_LABELS, CABLE_COLORS, CABLE_TYPE_LABELS, STATUS_COLORS } from '../utils/cableColors'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const doSearch = async (q) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`)
      setResults(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
    doSearch(q)
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearchParams(query ? { q: query } : {})
  }

  const total = results ? (results.devices.length + results.ports.length + results.connections.length + results.vlans.length) : 0

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-4">Search</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search devices, ports, connections, VLANs..."
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#06B6D4] transition-colors"
              autoFocus
            />
          </div>
          <button type="submit" className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Search
          </button>
        </form>
      </div>

      {loading && <div className="text-sm text-gray-500 animate-pulse">Searching...</div>}

      {results && !loading && (
        <>
          <div className="text-sm text-gray-500 mb-4">{total} result{total !== 1 ? 's' : ''} for <span className="text-gray-300">&quot;{searchParams.get('q')}&quot;</span></div>

          {/* Devices */}
          {results.devices.length > 0 && (
            <section className="mb-5">
              <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                Devices <span className="bg-[#1e1e1e] text-gray-400 rounded px-1.5 py-0.5">{results.devices.length}</span>
              </h2>
              <div className="bg-[#141414] border border-[#1f2937] rounded-lg divide-y divide-[#1f2937]">
                {results.devices.map(d => (
                  <Link key={d.id} to={`/devices/${d.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1e1e1e] transition-colors">
                    <DeviceTypeIcon type={d.device_type} size={14} className="text-[#06B6D4] shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{DEVICE_TYPE_LABELS[d.device_type]}</span>
                        {d.location_name && <span>· {d.location_name}</span>}
                        {d.make && <span className="font-mono">· {[d.make, d.model].filter(Boolean).join(' ')}</span>}
                      </div>
                    </div>
                    {d.management_ip && <span className="text-xs font-mono text-gray-500 shrink-0">{d.management_ip}</span>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Ports */}
          {results.ports.length > 0 && (
            <section className="mb-5">
              <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                Ports <span className="bg-[#1e1e1e] text-gray-400 rounded px-1.5 py-0.5">{results.ports.length}</span>
              </h2>
              <div className="bg-[#141414] border border-[#1f2937] rounded-lg divide-y divide-[#1f2937]">
                {results.ports.map(p => (
                  <Link key={p.id} to={`/devices/${p.device_id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1e1e1e] transition-colors">
                    <span className="font-mono text-xs text-[#06B6D4] w-24 shrink-0">{p.label}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{p.device_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.port_type} · {p.speed}</div>
                    </div>
                    <DeviceTypeIcon type={p.device_type} size={12} className="text-gray-500 shrink-0"/>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Connections */}
          {results.connections.length > 0 && (
            <section className="mb-5">
              <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                Connections <span className="bg-[#1e1e1e] text-gray-400 rounded px-1.5 py-0.5">{results.connections.length}</span>
              </h2>
              <div className="bg-[#141414] border border-[#1f2937] rounded-lg divide-y divide-[#1f2937]">
                {results.connections.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CABLE_COLORS[c.cable_type] || '#6B7280' }}/>
                    <div className="flex-1 min-w-0 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/devices/${c.device_a_id}`} className="text-white hover:text-[#06B6D4] font-medium">{c.device_a_name}</Link>
                        <span className="text-gray-500 font-mono text-xs">{c.port_a_label}</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-600 shrink-0"><line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        <Link to={`/devices/${c.device_b_id}`} className="text-white hover:text-[#06B6D4] font-medium">{c.device_b_name}</Link>
                        <span className="text-gray-500 font-mono text-xs">{c.port_b_label}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{CABLE_TYPE_LABELS[c.cable_type]}</div>
                    </div>
                    <span className="text-xs capitalize shrink-0" style={{ color: STATUS_COLORS[c.status] }}>{c.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* VLANs */}
          {results.vlans.length > 0 && (
            <section className="mb-5">
              <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                VLANs <span className="bg-[#1e1e1e] text-gray-400 rounded px-1.5 py-0.5">{results.vlans.length}</span>
              </h2>
              <div className="bg-[#141414] border border-[#1f2937] rounded-lg divide-y divide-[#1f2937]">
                {results.vlans.map(v => (
                  <Link key={v.id} to="/vlans"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1e1e1e] transition-colors">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: v.color }}/>
                    <span className="font-mono text-xs text-gray-500 w-16 shrink-0">VLAN {v.vlan_id}</span>
                    <span className="text-sm text-white">{v.name}</span>
                    {v.description && <span className="text-xs text-gray-600 truncate">{v.description}</span>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {total === 0 && (
            <div className="text-center py-10 text-gray-600 text-sm">No results found.</div>
          )}
        </>
      )}
    </div>
  )
}
