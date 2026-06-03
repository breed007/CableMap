import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { DEVICE_TYPE_LABELS } from '../utils/cableColors'
import DeviceTypeIcon from '../components/DeviceTypeIcon'

export default function Export() {
  const [devices, setDevices] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    api.get('/devices').then(r => setDevices(r.data))
    api.get('/summary').then(r => setSummary(r.data))
  }, [])

  const downloadConnections = () => { window.location.href = '/api/export/connections' }
  const downloadDevicePdf = (id) => { window.location.href = `/api/export/device/${id}/pdf` }
  const downloadBackup = () => { window.location.href = '/api/backup/export' }

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
