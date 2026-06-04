import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Modal from '../components/Modal'
import DeviceTypeIcon from '../components/DeviceTypeIcon'
import { DEVICE_TYPE_LABELS, FORM_FACTORS } from '../utils/cableColors'

const DEVICE_TYPES = ['switch','patch_panel','wall_plate','router','nas','access_point','server','firewall','modem','media_converter','ups','pdu','shelf','blank','other']

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [locations, setLocations] = useState([])
  const [templates, setTemplates] = useState([])
  const [filterLocation, setFilterLocation] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', device_type: 'switch', make: '', model: '', os: '', form_factor: '', location_id: '', rack_unit_start: '', rack_unit_height: '', management_ip: '', notes: '', capacity_watts: '', capacity_va: '', breaker_amps: '' })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [createPortsFromTemplate, setCreatePortsFromTemplate] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    const params = new URLSearchParams()
    if (filterLocation) params.set('location_id', filterLocation)
    if (filterType) params.set('device_type', filterType)
    api.get(`/devices?${params}`).then(r => setDevices(r.data))
  }

  useEffect(() => {
    load()
  }, [filterLocation, filterType])

  useEffect(() => {
    api.get('/locations').then(r => setLocations(r.data))
    api.get('/device-templates').then(r => setTemplates(r.data))
  }, [])

  const applyTemplate = (tpl) => {
    setSelectedTemplate(tpl)
    setForm(f => ({
      ...f,
      make: tpl.make,
      model: tpl.model,
      device_type: tpl.device_type,
      os: tpl.os || f.os,
      form_factor: tpl.form_factor || (tpl.rack_unit_height ? 'rackmount' : f.form_factor),
      rack_unit_height: tpl.rack_unit_height || '',
      capacity_watts: tpl.default_capacity_watts || f.capacity_watts,
      capacity_va: tpl.default_capacity_va || f.capacity_va,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await api.post('/devices', {
        ...form,
        location_id: form.location_id || null,
        rack_unit_start: form.rack_unit_start ? parseInt(form.rack_unit_start) : null,
        rack_unit_height: form.rack_unit_height ? parseInt(form.rack_unit_height) : null,
        capacity_watts: form.capacity_watts ? parseInt(form.capacity_watts) : null,
        capacity_va: form.capacity_va ? parseInt(form.capacity_va) : null,
        breaker_amps: form.breaker_amps ? parseInt(form.breaker_amps) : null,
      })
      const newDevice = res.data

      if (selectedTemplate && createPortsFromTemplate && selectedTemplate.default_ports.length > 0) {
        const isPatchPanel = form.device_type === 'patch_panel'
        if (isPatchPanel) {
          await api.post(`/devices/${newDevice.id}/ports/bulk-create`, {
            count: selectedTemplate.default_ports.length,
            prefix: 'Port ',
            port_type: selectedTemplate.default_ports[0]?.port_type || 'rj45',
            speed: selectedTemplate.default_ports[0]?.speed || '1g',
            is_patch_panel: true,
          })
        } else {
          for (const p of selectedTemplate.default_ports) {
            await api.post(`/devices/${newDevice.id}/ports/bulk-create`, {
              count: 1,
              prefix: p.label,
              port_type: p.port_type,
              speed: p.speed,
            })
          }
        }
      }

      // Create power outlets from the template (UPS / PDU)
      if (selectedTemplate && createPortsFromTemplate && (selectedTemplate.default_outlets?.length > 0)) {
        for (const o of selectedTemplate.default_outlets) {
          await api.post('/power/outlets', {
            device_id: newDevice.id,
            label: o.label,
            outlet_type: o.outlet_type,
            max_watts: o.max_watts || null,
          })
        }
      }

      setShowAdd(false)
      setForm({ name: '', device_type: 'switch', make: '', model: '', os: '', form_factor: '', location_id: '', rack_unit_start: '', rack_unit_height: '', management_ip: '', notes: '', capacity_watts: '', capacity_va: '', breaker_amps: '' })
      setSelectedTemplate(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const typeBadgeColor = (t) => {
    const colors = { switch: '#3B82F6', patch_panel: '#8B5CF6', router: '#06B6D4', firewall: '#EF4444', server: '#F59E0B', access_point: '#22C55E', other: '#6B7280', nas: '#EC4899', modem: '#D97706', wall_plate: '#6B7280', media_converter: '#10B981' }
    return colors[t] || '#6B7280'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Devices</h1>
          <p className="text-sm text-gray-500 mt-0.5">{devices.length} device{devices.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add Device
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All Types</option>
          {DEVICE_TYPES.map(t => <option key={t} value={t}>{DEVICE_TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2937] text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Make / Model</th>
              <th className="text-left px-4 py-3">Ports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {devices.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-600">No devices. Add one to get started.</td></tr>
            ) : devices.map(d => (
              <tr key={d.id} className="hover:bg-[#1e1e1e] transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/devices/${d.id}`} className="text-white hover:text-[#06B6D4] font-medium flex items-center gap-2 transition-colors">
                    <DeviceTypeIcon type={d.device_type} size={14} className="text-gray-400 shrink-0"/>
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: typeBadgeColor(d.device_type) + '22', color: typeBadgeColor(d.device_type) }}>
                    {DEVICE_TYPE_LABELS[d.device_type]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {d.location_name ? (
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.location_color }}/>
                      {d.location_name}
                    </span>
                  ) : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {[d.make, d.model].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-400">{d.port_count} </span>
                  <span className="text-gray-600 text-xs">({d.connected_port_count} connected)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Device Modal */}
      {showAdd && (
        <Modal title="Add Device" onClose={() => { setShowAdd(false); setError(''); setSelectedTemplate(null) }} size="lg">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Template selector — grouped by vendor */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Select model (optional)</label>
              <select
                onChange={e => { const t = templates.find(t => t.id === parseInt(e.target.value)); if (t) applyTemplate(t); else setSelectedTemplate(null) }}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]"
              >
                <option value="">-- Choose a model / template --</option>
                {(() => {
                  // Curated order: networking → security → NAS → servers → UPS → generic.
                  const order = [
                    'Ubiquiti', 'TP-Link Omada', 'MikroTik', 'Netgear', 'Aruba Instant On', 'Cisco',
                    'Fortinet', 'Palo Alto Networks', 'Cisco Meraki', 'Netgate', 'OPNsense', 'Sophos', 'SonicWall', 'Protectli',
                    'Synology', 'QNAP', 'TrueNAS', 'Asustor', 'UGREEN', 'Drobo', 'Custom',
                    'HP', 'APC', 'CyberPower', 'Eaton', 'Tripp Lite', 'Vertiv', 'Generic',
                  ]
                  const makes = [...new Set(templates.map(t => t.make))].sort((a, b) => {
                    const ia = order.indexOf(a), ib = order.indexOf(b)
                    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
                  })
                  return makes.map(make => (
                    <optgroup key={make} label={make}>
                      {templates.filter(t => t.make === make).map(t => (
                        <option key={t.id} value={t.id}>{t.model} ({t.sku})</option>
                      ))}
                    </optgroup>
                  ))
                })()}
              </select>
              {selectedTemplate && (
                <div className="mt-2 flex items-center gap-2">
                  <input type="checkbox" id="createPorts" checked={createPortsFromTemplate} onChange={e => setCreatePortsFromTemplate(e.target.checked)} className="rounded"/>
                  <label htmlFor="createPorts" className="text-xs text-gray-400">
                    Create {[
                      selectedTemplate.default_ports.length ? `${selectedTemplate.default_ports.length} port${selectedTemplate.default_ports.length !== 1 ? 's' : ''}` : null,
                      selectedTemplate.default_outlets?.length ? `${selectedTemplate.default_outlets.length} outlet${selectedTemplate.default_outlets.length !== 1 ? 's' : ''}` : null,
                    ].filter(Boolean).join(' + ') || 'items'} from template
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Name <span className="text-red-400">*</span></label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"
                  placeholder="Core Switch 1"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Type <span className="text-red-400">*</span></label>
                <select required value={form.device_type} onChange={e => setForm(f => ({ ...f, device_type: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{DEVICE_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Location</label>
                <select value={form.location_id} onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  <option value="">Unassigned</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Make</label>
                <input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="Ubiquiti"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Model</label>
                <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="USW-Pro-24"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">OS / Firmware</label>
                <input value={form.os} onChange={e => setForm(f => ({ ...f, os: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="UniFi OS 4.0"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Form Factor</label>
                <select value={form.form_factor} onChange={e => setForm(f => ({ ...f, form_factor: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  <option value="">—</option>
                  {FORM_FACTORS.map(ff => <option key={ff.value} value={ff.value}>{ff.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Management IP</label>
                <input value={form.management_ip} onChange={e => setForm(f => ({ ...f, management_ip: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#06B6D4]" placeholder="192.168.1.1"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Rack Unit Start</label>
                <input type="number" value={form.rack_unit_start} onChange={e => setForm(f => ({ ...f, rack_unit_start: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="1"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Rack Unit Height</label>
                <input type="number" value={form.rack_unit_height} onChange={e => setForm(f => ({ ...f, rack_unit_height: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="1"/>
              </div>
              {(form.device_type === 'ups' || form.device_type === 'pdu') && (
                <div className="col-span-2 grid grid-cols-3 gap-3 bg-[#0d0d0d] border border-[#1f2937] rounded-lg p-3">
                  <div className="col-span-3 text-[11px] text-gray-500 uppercase tracking-wide">Power Capacity</div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Capacity (W)</label>
                    <input type="number" value={form.capacity_watts} onChange={e => setForm(f => ({ ...f, capacity_watts: e.target.value }))}
                      className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="1000"/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Rating (VA)</label>
                    <input type="number" value={form.capacity_va} onChange={e => setForm(f => ({ ...f, capacity_va: e.target.value }))}
                      className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="1500"/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Breaker (A)</label>
                    <input type="number" value={form.breaker_amps} onChange={e => setForm(f => ({ ...f, breaker_amps: e.target.value }))}
                      className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="15"/>
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows="2"
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4] resize-none"/>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Add Device'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
