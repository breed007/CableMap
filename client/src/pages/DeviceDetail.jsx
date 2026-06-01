import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import Modal from '../components/Modal'
import DeviceTypeIcon from '../components/DeviceTypeIcon'
import PhotoUploader from '../components/PhotoUploader'
import DocumentUploader from '../components/DocumentUploader'
import { DEVICE_TYPE_LABELS, PORT_TYPE_LABELS, SPEED_LABELS, CABLE_COLORS, STATUS_COLORS, PASSIVE_DEVICE_TYPES, FORM_FACTORS, FORM_FACTOR_LABELS } from '../utils/cableColors'

const DEVICE_TYPES = ['switch','patch_panel','wall_plate','router','nas','access_point','server','firewall','modem','media_converter','ups','pdu','shelf','blank','other']
const PORT_TYPES = ['rj45','sfp','sfp_plus','qsfp','lc_fiber','sc_fiber','usb_a','usb_c','other']
const SPEEDS = ['100m','1g','2_5g','5g','10g','25g','40g','100g','unknown']

export default function DeviceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [device, setDevice] = useState(null)
  const [locations, setLocations] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [showDelete, setShowDelete] = useState(false)
  const [showAddPorts, setShowAddPorts] = useState(false)
  const [portForm, setPortForm] = useState({ count: 1, prefix: 'Port ', port_type: 'rj45', speed: '1g' })
  const [selectedPort, setSelectedPort] = useState(null)
  const [portDetail, setPortDetail] = useState(null)
  const [traceSteps, setTraceSteps] = useState([])
  const [traceLoading, setTraceLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    api.get(`/devices/${id}`).then(r => { setDevice(r.data); setForm(r.data) })
  }

  useEffect(() => {
    load()
    api.get('/locations').then(r => setLocations(r.data))
  }, [id])

  const openPort = async (port) => {
    setSelectedPort(port)
    setTraceSteps([])
    setTraceLoading(true)
    const [detail, trace] = await Promise.all([
      api.get(`/ports/${port.id}`),
      api.get(`/ports/${port.id}/trace`),
    ])
    setPortDetail(detail.data)
    setTraceSteps(trace.data)
    setTraceLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.put(`/devices/${id}`, {
        ...form,
        location_id: form.location_id || null,
        rack_unit_start: form.rack_unit_start ? parseInt(form.rack_unit_start) : null,
        rack_unit_height: form.rack_unit_height ? parseInt(form.rack_unit_height) : null,
      })
      setEditMode(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await api.delete(`/devices/${id}`)
    navigate('/devices')
  }

  const handleAddPorts = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/devices/${id}/ports/bulk-create`, portForm)
      setShowAddPorts(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add ports')
    }
  }

  if (!device) return <div className="p-8 text-gray-500 text-sm">Loading...</div>

  const isPatchPanel = device.device_type === 'patch_panel'
  const frontPorts = isPatchPanel ? device.ports.filter(p => p.panel_side === 'front') : device.ports
  const backPorts = isPatchPanel ? device.ports.filter(p => p.panel_side === 'back') : []

  const noteLabels = { origin: 'Start', connection: 'Connected', patch_through: 'Patch Through', endpoint: 'End', dead_end: 'Dead End', cycle_detected: 'Cycle' }
  const noteColors = { origin: '#06B6D4', connection: '#22C55E', patch_through: '#8B5CF6', endpoint: '#22C55E', dead_end: '#6B7280', cycle_detected: '#EF4444' }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#1e1e1e] rounded-lg mt-0.5">
            <DeviceTypeIcon type={device.device_type} size={20} className="text-[#06B6D4]"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">{device.name}</h1>
              <span className="text-xs px-2 py-0.5 bg-[#1e1e1e] text-gray-400 rounded">{DEVICE_TYPE_LABELS[device.device_type]}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {device.location_name && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: device.location_color }}/>
                  {device.location_name}
                </span>
              )}
              {device.make && <span className="font-mono text-xs">{[device.make, device.model].filter(Boolean).join(' ')}</span>}
              {device.os && <span className="text-xs">{device.os}</span>}
              {device.form_factor && <span className="text-xs text-gray-600">{FORM_FACTOR_LABELS[device.form_factor] || device.form_factor}</span>}
              {device.rack_unit_start && (
                <span className="font-mono text-xs text-gray-400">U{device.rack_unit_start}{device.rack_unit_height > 1 ? `–${device.rack_unit_start + device.rack_unit_height - 1}` : ''}</span>
              )}
              {device.management_ip && (
                <a href={`http://${device.management_ip}`} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-[#06B6D4] hover:underline">{device.management_ip}</a>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditMode(true)} className="text-sm px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors">Edit</button>
          <button onClick={() => setShowDelete(true)} className="text-sm px-3 py-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-red-400 rounded-lg transition-colors">Delete</button>
        </div>
      </div>

      {device.notes && (
        <div className="mb-4 text-sm text-gray-400 bg-[#1e1e1e] rounded-lg px-4 py-3 border-l-2 border-[#374151]">{device.notes}</div>
      )}

      {/* Ports */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
          <h2 className="text-sm font-semibold text-white">Ports <span className="text-gray-500 font-normal">({device.ports.length}{isPatchPanel ? ' total' : ''})</span></h2>
          <button onClick={() => setShowAddPorts(true)} className="text-xs px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded transition-colors">+ Add Ports</button>
        </div>

        {device.ports.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-600">No ports. <button onClick={() => setShowAddPorts(true)} className="text-[#06B6D4] hover:underline">Add ports</button></div>
        ) : isPatchPanel ? (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-1">Front</div>
                <div className="space-y-1">
                  {frontPorts.map(port => <PortRow key={port.id} port={port} onClick={() => openPort(port)} selected={selectedPort?.id === port.id}/>)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-1">Back</div>
                <div className="space-y-1">
                  {backPorts.map(port => <PortRow key={port.id} port={port} onClick={() => openPort(port)} selected={selectedPort?.id === port.id}/>)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {device.ports.map(port => <PortRow key={port.id} port={port} onClick={() => openPort(port)} selected={selectedPort?.id === port.id}/>)}
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-4 p-4">
        <PhotoUploader entityType="device" entityId={device.id} title="Device Photos"/>
      </div>

      {/* Documents — spec sheets, Visio stencils */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-4 p-4">
        <DocumentUploader entityType="device" entityId={device.id} title="Spec Sheets & Documents"/>
      </div>

      {/* Port Detail Side Panel */}
      {selectedPort && portDetail && (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
            <h2 className="text-sm font-semibold text-white font-mono">{portDetail.label}</h2>
            <button onClick={() => { setSelectedPort(null); setPortDetail(null) }} className="text-gray-500 hover:text-white transition-colors text-lg">&times;</button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div><span className="text-gray-500 text-xs">Type</span><div className="text-gray-200 mt-0.5">{PORT_TYPE_LABELS[portDetail.port_type]}</div></div>
              <div><span className="text-gray-500 text-xs">Speed</span><div className="text-gray-200 mt-0.5">{SPEED_LABELS[portDetail.speed]}</div></div>
              {portDetail.panel_side && <div><span className="text-gray-500 text-xs">Side</span><div className="text-gray-200 mt-0.5 capitalize">{portDetail.panel_side}</div></div>}
            </div>

            {portDetail.connection ? (
              <div className="mb-4 bg-[#1e1e1e] rounded-lg p-3 text-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Connection</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CABLE_COLORS[portDetail.connection.cable_type] || '#6B7280' }}/>
                  <Link to={`/devices/${portDetail.connection.device_a_id === device.id ? portDetail.connection.device_b_id : portDetail.connection.device_a_id}`}
                    className="text-[#06B6D4] hover:underline font-medium">
                    {portDetail.connection.device_a_id === device.id ? portDetail.connection.device_b_name : portDetail.connection.device_a_name}
                  </Link>
                  <span className="text-gray-500 font-mono text-xs">
                    {portDetail.connection.device_a_id === device.id ? portDetail.connection.port_b_label : portDetail.connection.port_a_label}
                  </span>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span>{portDetail.connection.cable_type}</span>
                  {portDetail.connection.cable_length_ft && <span>{portDetail.connection.cable_length_ft}ft</span>}
                  {portDetail.connection.vlan_name && <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: portDetail.connection.vlan_color + '33', color: portDetail.connection.vlan_color }}>VLAN {portDetail.connection.vlan_number} {portDetail.connection.vlan_name}</span>}
                  <span className="capitalize" style={{ color: STATUS_COLORS[portDetail.connection.status] }}>{portDetail.connection.status}</span>
                </div>
              </div>
            ) : (
              <div className="mb-4 bg-[#1e1e1e] rounded-lg p-3 text-sm text-gray-600">No active connection</div>
            )}

            {/* Trace */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Port Trace</div>
              {traceLoading ? (
                <div className="text-xs text-gray-600 animate-pulse">Tracing...</div>
              ) : traceSteps.length <= 1 ? (
                <div className="text-xs text-gray-600">No trace path</div>
              ) : (
                <div className="space-y-1">
                  {traceSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {i > 0 && <div className="w-px h-3 bg-[#374151] ml-3"/>}
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: (noteColors[step.note] || '#6B7280') + '22', color: noteColors[step.note] || '#6B7280' }}>
                          {noteLabels[step.note] || step.note}
                        </span>
                        <Link to={`/devices/${step.device.id}`} className="text-gray-300 hover:text-white font-medium">{step.device.name}</Link>
                        <span className="text-gray-500 font-mono">{step.port.label}</span>
                        {step.port.panel_side && <span className="text-gray-600 text-xs">({step.port.panel_side})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMode && (
        <Modal title="Edit Device" onClose={() => setEditMode(false)} size="lg">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Name</label>
                <input required value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Type</label>
                <select value={form.device_type || ''} onChange={e => setForm(f => ({ ...f, device_type: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{DEVICE_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Location</label>
                <select value={form.location_id || ''} onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  <option value="">Unassigned</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Make</label>
                <input value={form.make || ''} onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Model</label>
                <input value={form.model || ''} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">OS / Firmware</label>
                <input value={form.os || ''} onChange={e => setForm(f => ({ ...f, os: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Form Factor</label>
                <select value={form.form_factor || ''} onChange={e => setForm(f => ({ ...f, form_factor: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  <option value="">—</option>
                  {FORM_FACTORS.map(ff => <option key={ff.value} value={ff.value}>{ff.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Management IP</label>
                <input value={form.management_ip || ''} onChange={e => setForm(f => ({ ...f, management_ip: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Rack Unit Start</label>
                <input type="number" value={form.rack_unit_start || ''} onChange={e => setForm(f => ({ ...f, rack_unit_start: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Rack Unit Height</label>
                <input type="number" value={form.rack_unit_height || ''} onChange={e => setForm(f => ({ ...f, rack_unit_height: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows="2"
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4] resize-none"/>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Ports Modal */}
      {showAddPorts && (
        <Modal title="Add Ports" onClose={() => setShowAddPorts(false)}>
          <form onSubmit={handleAddPorts} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Count</label>
                <input type="number" min="1" max="96" required value={portForm.count} onChange={e => setPortForm(f => ({ ...f, count: parseInt(e.target.value) }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Label Prefix</label>
                <input value={portForm.prefix} onChange={e => setPortForm(f => ({ ...f, prefix: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="Port "/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Port Type</label>
                <select value={portForm.port_type} onChange={e => setPortForm(f => ({ ...f, port_type: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  {PORT_TYPES.map(t => <option key={t} value={t}>{PORT_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Speed</label>
                <select value={portForm.speed} onChange={e => setPortForm(f => ({ ...f, speed: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  {SPEEDS.map(s => <option key={s} value={s}>{SPEED_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            {isPatchPanel && (
              <p className="text-xs text-gray-500">Patch panel: front/back port pairs will be created automatically.</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddPorts(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Add {portForm.count} Port{portForm.count !== 1 ? 's' : ''}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <Modal title="Delete Device" onClose={() => setShowDelete(false)} size="sm">
          <p className="text-sm text-gray-400 mb-4">
            Are you sure you want to delete <strong className="text-white">{device.name}</strong>? This will also delete all {device.ports.length} port{device.ports.length !== 1 ? 's' : ''} and their connections.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleDelete} className="bg-[#EF4444] hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function PortRow({ port, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm ${
        selected ? 'bg-[#06B6D4]/10 border border-[#06B6D4]/30' : 'bg-[#1e1e1e] hover:bg-[#252525] border border-transparent'
      }`}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: port.is_connected ? '#22C55E' : '#6B7280' }}/>
      <span className="font-mono text-xs text-gray-300 truncate">{port.label}</span>
      <span className="text-xs text-gray-600 ml-auto shrink-0">{SPEED_LABELS[port.speed]}</span>
    </button>
  )
}
