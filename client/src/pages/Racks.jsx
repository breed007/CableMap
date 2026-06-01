import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Modal from '../components/Modal'
import PhotoUploader from '../components/PhotoUploader'
import DeviceTypeIcon from '../components/DeviceTypeIcon'
import { DEVICE_TYPE_LABELS, DEVICE_TYPE_COLORS } from '../utils/cableColors'

// ─── Rack elevation visual ─────────────────────────────────────────────────
function RackElevation({ rack, devices, onAssign }) {
  const totalU = rack.rack_units || 12
  // Build slot map: which device occupies each U (U numbered 1..totalU, 1 at bottom)
  const occupancy = {} // u -> device (the device whose span includes u)
  const placed = devices.filter(d => d.rack_unit_start)
  for (const d of placed) {
    const start = d.rack_unit_start
    const height = d.rack_unit_height || 1
    for (let u = start; u < start + height; u++) occupancy[u] = d
  }

  // Render from top (totalU) down to 1
  const rows = []
  for (let u = totalU; u >= 1; u--) {
    const dev = occupancy[u]
    const isTopOfDevice = dev && (u === dev.rack_unit_start + (dev.rack_unit_height || 1) - 1)
    rows.push({ u, dev, isTopOfDevice })
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#1f2937] rounded-lg p-3 select-none">
      <div className="flex flex-col">
        {rows.map(({ u, dev, isTopOfDevice }) => (
          <div key={u} className="flex items-stretch" style={{ height: 30 }}>
            {/* U number rail */}
            <div className="w-8 shrink-0 flex items-center justify-center text-[10px] font-mono text-gray-600 border-r border-[#1f2937]">
              {u}
            </div>
            {/* Slot */}
            <div className="flex-1 relative">
              {dev ? (
                isTopOfDevice && (
                  <Link
                    to={`/devices/${dev.id}`}
                    className="absolute inset-x-1 rounded flex items-center gap-2 px-3 hover:brightness-125 transition-all"
                    style={{
                      top: 2,
                      bottom: 2,
                      height: `calc(${(dev.rack_unit_height || 1) * 30}px - 4px)`,
                      backgroundColor: (DEVICE_TYPE_COLORS[dev.device_type] || '#374151') + '22',
                      borderLeft: `3px solid ${DEVICE_TYPE_COLORS[dev.device_type] || '#374151'}`,
                    }}
                  >
                    <DeviceTypeIcon type={dev.device_type} size={14} className="text-gray-300 shrink-0"/>
                    <span className="text-xs font-medium text-white truncate">{dev.name}</span>
                    <span className="text-[10px] text-gray-500 ml-auto shrink-0">{(dev.rack_unit_height || 1)}U</span>
                  </Link>
                )
              ) : (
                <button
                  onClick={() => onAssign(u)}
                  className="absolute inset-x-1 top-0.5 bottom-0.5 rounded border border-dashed border-[#1f2937] hover:border-[#06B6D4] hover:bg-[#06B6D4]/5 transition-colors flex items-center justify-center text-[10px] text-gray-700 hover:text-[#06B6D4]"
                >
                  empty
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Racks() {
  const [locations, setLocations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [rack, setRack] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [assignSlot, setAssignSlot] = useState(null)
  const [unrackedToAssign, setUnrackedToAssign] = useState('')
  const [assignHeight, setAssignHeight] = useState(1)
  const [form, setForm] = useState({ name: '', rack_units: 12, color: '#3B82F6' })
  const [error, setError] = useState('')

  const loadList = useCallback(() => {
    api.get('/locations').then(r => {
      const racks = r.data.filter(l => l.is_rack)
      setLocations(r.data)
      if (!selectedId && racks.length) setSelectedId(racks[0].id)
    })
  }, [selectedId])

  const loadRack = useCallback(() => {
    if (!selectedId) { setRack(null); return }
    api.get(`/locations/${selectedId}`).then(r => setRack(r.data))
  }, [selectedId])

  useEffect(() => { loadList() }, [])
  useEffect(() => { loadRack() }, [loadRack])

  const racks = locations.filter(l => l.is_rack)
  const unracked = rack ? rack.devices.filter(d => !d.rack_unit_start) : []

  const handleCreateRack = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/locations', { name: form.name, color: form.color, rack_units: parseInt(form.rack_units), is_rack: 1 })
      setShowNew(false)
      setForm({ name: '', rack_units: 12, color: '#3B82F6' })
      setSelectedId(res.data.id)
      loadList()
    } catch (err) { setError(err.response?.data?.error || 'Failed') }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    await api.put(`/locations/${rack.id}`, { name: rack.name, color: rack.color, rack_units: parseInt(rack.rack_units), is_rack: 1, description: rack.description })
    setShowSettings(false)
    loadList(); loadRack()
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!unrackedToAssign) return
    await api.put(`/devices/${unrackedToAssign}`, {
      ...rack.devices.find(d => d.id === parseInt(unrackedToAssign)),
      rack_unit_start: assignSlot,
      rack_unit_height: parseInt(assignHeight),
    })
    setAssignSlot(null)
    setUnrackedToAssign('')
    setAssignHeight(1)
    loadRack()
  }

  const removeFromRack = async (device) => {
    await api.put(`/devices/${device.id}`, { ...device, rack_unit_start: null })
    loadRack()
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Racks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Front-of-rack layout & photos</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> New Rack
        </button>
      </div>

      {racks.length === 0 ? (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg px-4 py-12 text-center">
          <p className="text-sm text-gray-500 mb-3">No racks yet.</p>
          <button onClick={() => setShowNew(true)} className="text-sm text-[#06B6D4] hover:underline">Create your first rack</button>
        </div>
      ) : (
        <>
          {/* Rack tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {racks.map(r => (
              <button key={r.id} onClick={() => setSelectedId(r.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedId === r.id ? 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30' : 'bg-[#1e1e1e] text-gray-400 border border-transparent hover:text-gray-200'
                }`}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}/>
                {r.name}
                <span className="text-xs text-gray-600">{r.rack_units || '?'}U</span>
              </button>
            ))}
          </div>

          {rack && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Elevation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-white">{rack.name} — Elevation</h2>
                  <button onClick={() => setShowSettings(true)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Settings</button>
                </div>
                <RackElevation rack={rack} devices={rack.devices} onAssign={(u) => setAssignSlot(u)}/>

                {unracked.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Not yet placed ({unracked.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {unracked.map(d => (
                        <Link key={d.id} to={`/devices/${d.id}`}
                          className="flex items-center gap-1.5 text-xs px-2 py-1 bg-[#1e1e1e] rounded border border-[#374151] hover:border-[#06B6D4] transition-colors">
                          <DeviceTypeIcon type={d.device_type} size={11} className="text-gray-400"/>
                          {d.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Photos + device list */}
              <div className="space-y-5">
                <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4">
                  <PhotoUploader entityType="location" entityId={rack.id} title="Rack Photos"/>
                </div>

                <div className="bg-[#141414] border border-[#1f2937] rounded-lg">
                  <div className="px-4 py-3 border-b border-[#1f2937] text-sm font-semibold text-white">
                    Devices in this rack ({rack.devices.length})
                  </div>
                  {rack.devices.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-600">
                      No devices. <Link to="/devices" className="text-[#06B6D4] hover:underline">Add a device</Link> and set its location to {rack.name}.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1f2937]">
                      {rack.devices.map(d => (
                        <div key={d.id} className="px-4 py-2.5 flex items-center gap-2 text-sm">
                          <DeviceTypeIcon type={d.device_type} size={13} className="text-gray-400 shrink-0"/>
                          <Link to={`/devices/${d.id}`} className="text-white hover:text-[#06B6D4] font-medium truncate">{d.name}</Link>
                          <span className="text-xs text-gray-600">{DEVICE_TYPE_LABELS[d.device_type]}</span>
                          <span className="ml-auto text-xs shrink-0">
                            {d.rack_unit_start ? (
                              <span className="text-gray-500 font-mono">U{d.rack_unit_start}{(d.rack_unit_height > 1) ? `–${d.rack_unit_start + d.rack_unit_height - 1}` : ''}
                                <button onClick={() => removeFromRack(d)} className="ml-2 text-gray-700 hover:text-red-400">remove</button>
                              </span>
                            ) : (
                              <button onClick={() => { setAssignSlot(1); setUnrackedToAssign(String(d.id)); setAssignHeight(d.rack_unit_height || 1) }}
                                className="text-[#06B6D4] hover:underline">place</button>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* New rack modal */}
      {showNew && (
        <Modal title="New Rack" onClose={() => setShowNew(false)} size="sm">
          <form onSubmit={handleCreateRack} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="Main Rack"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Height (U)</label>
                <input type="number" min="1" max="48" required value={form.rack_units} onChange={e => setForm(f => ({ ...f, rack_units: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Color</label>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded h-[38px] px-1 cursor-pointer"/>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Settings modal */}
      {showSettings && rack && (
        <Modal title="Rack Settings" onClose={() => setShowSettings(false)} size="sm">
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Name</label>
              <input value={rack.name} onChange={e => setRack(r => ({ ...r, name: e.target.value }))}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Height (U)</label>
                <input type="number" min="1" max="48" value={rack.rack_units || ''} onChange={e => setRack(r => ({ ...r, rack_units: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Color</label>
                <input type="color" value={rack.color || '#3B82F6'} onChange={e => setRack(r => ({ ...r, color: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded h-[38px] px-1 cursor-pointer"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign slot modal */}
      {assignSlot !== null && rack && (
        <Modal title={`Place device at U${assignSlot}`} onClose={() => { setAssignSlot(null); setUnrackedToAssign('') }} size="sm">
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Device</label>
              <select required value={unrackedToAssign} onChange={e => {
                  setUnrackedToAssign(e.target.value)
                  const d = rack.devices.find(d => d.id === parseInt(e.target.value))
                  if (d) setAssignHeight(d.rack_unit_height || 1)
                }}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                <option value="">-- choose a device --</option>
                {unracked.map(d => <option key={d.id} value={d.id}>{d.name} ({DEVICE_TYPE_LABELS[d.device_type]})</option>)}
              </select>
              {unracked.length === 0 && <p className="text-xs text-gray-600 mt-1">All devices in this rack are already placed.</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Bottom U position</label>
                <input type="number" min="1" max={rack.rack_units} value={assignSlot} onChange={e => setAssignSlot(parseInt(e.target.value))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Height (U)</label>
                <input type="number" min="1" max="12" value={assignHeight} onChange={e => setAssignHeight(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => { setAssignSlot(null); setUnrackedToAssign('') }} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={!unrackedToAssign} className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">Place</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
