import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

const SEVERITY = {
  error: { color: '#EF4444', label: 'Error' },
  warning: { color: '#F59E0B', label: 'Warning' },
  info: { color: '#06B6D4', label: 'Info' },
}

function ItemRow({ checkKey, item }) {
  switch (checkKey) {
    case 'ports_double_booked':
      return <span><Link to={`/devices/${item.device_id}`} className="text-[#06B6D4] hover:underline">{item.device_name}</Link> <span className="font-mono text-gray-400">{item.label}</span> is in {item.active_count} active connections</span>
    case 'rack_overlaps':
      return <span><span className="text-gray-400">{item.location_name}:</span> <Link to={`/devices/${item.a_id}`} className="text-[#06B6D4] hover:underline">{item.a_name}</Link> <span className="font-mono text-gray-500">{item.a_u}</span> overlaps <Link to={`/devices/${item.b_id}`} className="text-[#06B6D4] hover:underline">{item.b_name}</Link> <span className="font-mono text-gray-500">{item.b_u}</span></span>
    case 'ups_overloaded':
      return <span><Link to={`/devices/${item.id}`} className="text-[#06B6D4] hover:underline">{item.name}</Link> drawing <span className="text-red-400 font-medium">{item.connected_watts}W</span> of {item.capacity_watts}W ({item.load_pct}%)</span>
    case 'power_unmapped':
      return <span><Link to={`/devices/${item.id}`} className="text-[#06B6D4] hover:underline">{item.name}</Link> <span className="text-gray-600 text-xs">({item.device_type})</span> has no power source mapped</span>
    case 'devices_no_ports':
      return <span><Link to={`/devices/${item.id}`} className="text-[#06B6D4] hover:underline">{item.name}</Link> <span className="text-gray-600 text-xs">({item.device_type})</span> has no ports</span>
    case 'planned_connections':
      return <span><span className="text-gray-300">{item.device_a_name}</span> <span className="font-mono text-gray-500 text-xs">{item.port_a_label}</span> ↔ <span className="text-gray-300">{item.device_b_name}</span> <span className="font-mono text-gray-500 text-xs">{item.port_b_label}</span> still planned</span>
    default:
      return <span className="text-gray-400">{JSON.stringify(item)}</span>
  }
}

export default function Health() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => { setLoading(true); api.get('/health').then(r => { setData(r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Health Check</h1>
          <p className="text-sm text-gray-500 mt-0.5">Consistency &amp; completeness of your documentation</p>
        </div>
        <button onClick={load} className="text-sm px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors">Re-run</button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600 animate-pulse">Checking…</div>
      ) : data.total_issues === 0 ? (
        <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg px-4 py-10 text-center">
          <div className="text-3xl mb-2">✓</div>
          <div className="text-sm text-green-400 font-medium">All clear — no issues found.</div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-400 mb-4">{data.total_issues} issue{data.total_issues !== 1 ? 's' : ''} across {data.checks.filter(c => c.items.length).length} check{data.checks.filter(c => c.items.length).length !== 1 ? 's' : ''}.</div>
          <div className="space-y-4">
            {data.checks.filter(c => c.items.length > 0).map(check => {
              const sev = SEVERITY[check.severity] || SEVERITY.info
              return (
                <div key={check.key} className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f2937]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sev.color }} />
                    <span className="text-sm font-semibold text-white">{check.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded ml-auto" style={{ backgroundColor: sev.color + '22', color: sev.color }}>{check.items.length}</span>
                  </div>
                  <div className="divide-y divide-[#1f2937]">
                    {check.items.map((item, i) => (
                      <div key={i} className="px-4 py-2.5 text-sm text-gray-300"><ItemRow checkKey={check.key} item={item} /></div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Show the passing checks too, for reassurance */}
      {!loading && data && (
        <div className="mt-6">
          <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Checks run</div>
          <div className="flex flex-wrap gap-2">
            {data.checks.map(c => (
              <span key={c.key} className={`text-xs px-2 py-1 rounded ${c.items.length ? 'bg-[#1e1e1e] text-gray-400' : 'bg-[#22C55E]/10 text-green-400'}`}>
                {c.items.length ? '•' : '✓'} {c.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
