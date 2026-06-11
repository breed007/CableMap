import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { DEVICE_TYPE_LABELS } from '../utils/cableColors'
import DeviceTypeIcon from '../components/DeviceTypeIcon'

export default function Export() {
  const [devices, setDevices] = useState([])
  const [summary, setSummary] = useState(null)
  const [shares, setShares] = useState([])
  const [shareLabel, setShareLabel] = useState('')
  const [copied, setCopied] = useState(null)

  const loadShares = () => api.get('/share').then(r => setShares(r.data))
  useEffect(() => {
    api.get('/devices').then(r => setDevices(r.data))
    api.get('/summary').then(r => setSummary(r.data))
    loadShares()
  }, [])

  const downloadConnections = () => { window.location.href = '/api/export/connections' }
  const downloadDevicePdf = (id) => { window.location.href = `/api/export/device/${id}/pdf` }
  const downloadBackup = () => { window.location.href = '/api/backup/export' }
  const downloadTopology = () => { window.location.href = '/api/export/topology.json' }

  const createShare = async () => {
    await api.post('/share', { label: shareLabel || null }); setShareLabel(''); loadShares()
  }
  const revokeShare = async (id) => { await api.post(`/share/${id}/revoke`); loadShares() }
  const deleteShare = async (id) => { await api.delete(`/share/${id}`); loadShares() }
  const shareUrl = (token) => `${window.location.origin}/share/${token}`
  const copyShare = (token) => {
    navigator.clipboard?.writeText(shareUrl(token))
    setCopied(token); setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Export</h1>
        <p className="text-sm text-gray-500">Download your network documentation.</p>
      </div>

      {/* Full backup */}
      <div className="bg-[#141414] border border-[#06B6D4]/30 rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white mb-1">Full Backup — ZIP</div>
            <div className="text-xs text-gray-500">
              Everything: devices, ports, connections, racks, VLANs, power mapping, history, custom templates, and all photos &amp; documents. Restore from the Import page.
            </div>
          </div>
          <button onClick={downloadBackup}
            className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 11v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Download Backup
          </button>
        </div>
      </div>

      {/* Read-only share links */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-5 mb-4">
        <div className="text-sm font-semibold text-white mb-1">Read-only Share Links</div>
        <div className="text-xs text-gray-500 mb-3">
          A no-login "live view" (device status, structure, connections) for a wall display or a colleague. Revocable. Photos and editing are never exposed.
        </div>
        <div className="flex gap-2 mb-3">
          <input value={shareLabel} onChange={e => setShareLabel(e.target.value)} placeholder="Label (optional, e.g. Wall display)"
            className="flex-1 bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
          <button onClick={createShare} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg shrink-0">Create link</button>
        </div>
        {shares.length === 0 ? (
          <div className="text-xs text-gray-600">No share links yet.</div>
        ) : (
          <div className="space-y-1.5">
            {shares.map(s => (
              <div key={s.id} className={`flex items-center gap-2 text-sm bg-[#1e1e1e] rounded px-3 py-2 ${s.revoked ? 'opacity-50' : ''}`}>
                <span className="text-gray-300 truncate">{s.label || 'Untitled'}</span>
                {s.revoked && <span className="text-[10px] text-red-400">revoked</span>}
                <code className="text-xs text-gray-600 font-mono truncate ml-2 flex-1">/share/{s.token.slice(0, 10)}…</code>
                {!s.revoked && (
                  <>
                    <a href={shareUrl(s.token)} target="_blank" rel="noreferrer" className="text-xs text-[#06B6D4] hover:underline shrink-0">open</a>
                    <button onClick={() => copyShare(s.token)} className="text-xs text-gray-400 hover:text-white shrink-0">{copied === s.token ? 'copied!' : 'copy'}</button>
                    <button onClick={() => revokeShare(s.id)} className="text-xs text-amber-500 hover:text-amber-400 shrink-0">revoke</button>
                  </>
                )}
                <button onClick={() => deleteShare(s.id)} className="text-xs text-gray-600 hover:text-red-400 shrink-0">delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topology JSON (interop) */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white mb-1">Topology — JSON</div>
            <div className="text-xs text-gray-500">Clean device + connection graph for interop with other tools (Homepage, dashboards, scripts). Also available per share link at <code className="font-mono">/api/public/&lt;token&gt;/topology.json</code>.</div>
          </div>
          <button onClick={downloadTopology} className="text-sm px-4 py-2 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors shrink-0">Download JSON</button>
        </div>
      </div>

      {/* All connections CSV */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white mb-1">All Connections — CSV</div>
            <div className="text-xs text-gray-500">
              {summary ? `${summary.total_connections} connection${summary.total_connections !== 1 ? 's' : ''}` : '…'} · CSV format, all fields
            </div>
          </div>
          <button onClick={downloadConnections}
            className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 11v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Download CSV
          </button>
        </div>
      </div>

      {/* Canvas SVG — link to canvas */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white mb-1">Canvas — SVG</div>
            <div className="text-xs text-gray-500">Use the "Export SVG" button on the Canvas view</div>
          </div>
          <Link to="/canvas" className="text-sm px-4 py-2 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors">
            Go to Canvas
          </Link>
        </div>
      </div>

      {/* Per-device PDF */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1f2937]">
          <div className="text-sm font-semibold text-white">Device Port Maps — PDF</div>
          <div className="text-xs text-gray-500 mt-0.5">Printable port list for each device</div>
        </div>
        {devices.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-600">No devices yet.</div>
        ) : (
          <div className="divide-y divide-[#1f2937]">
            {devices.map(d => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <DeviceTypeIcon type={d.device_type} size={14} className="text-gray-500 shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium">{d.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {DEVICE_TYPE_LABELS[d.device_type]}
                    {d.location_name ? ` · ${d.location_name}` : ''}
                    {' · '}{d.port_count} port{d.port_count !== 1 ? 's' : ''}
                  </div>
                </div>
                <button onClick={() => downloadDevicePdf(d.id)}
                  className="text-xs px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v6M4 5l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
