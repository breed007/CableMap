import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Modal from '../components/Modal'
import PhotoUploader from '../components/PhotoUploader'
import { CABLE_COLORS, CABLE_TYPE_LABELS, STATUS_COLORS } from '../utils/cableColors'

const CABLE_TYPES = ['cat5e','cat6','cat6a','cat7','cat8','om3_fiber','os2_fiber','dac','other']
const STATUSES = ['active','inactive','planned','unknown']

function PortSearch({ label, value, onChange }) {
  const [query, setQuery] = useState(value?.display || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    const res = await api.get(`/search?q=${encodeURIComponent(q)}`)
    setResults(res.data.ports || [])
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 250)
    return () => clearTimeout(t)
  }, [query, search])

  const select = (port) => {
    onChange({ id: port.id, display: `${port.device_name} / ${port.label}` })
    setQuery(`${port.device_name} / ${port.label}`)
    setOpen(false)
    setResults([])
  }

  return (
    <div className="relative">
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(null) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"
        placeholder="Type device name or port label..."
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#374151] rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
          {results.map(p => (
            <button key={p.id} onMouseDown={() => select(p)}
              className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[#374151] transition-colors text-sm">
              <span className="text-gray-400 truncate">{p.device_name}</span>
              <span className="text-[#06B6D4] font-mono text-xs shrink-0">{p.label}</span>
              <span className="text-gray-600 text-xs ml-auto shrink-0">{p.port_type} · {p.speed}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Connections() {
  const [connections, setConnections] = useState([])
  const [locations, setLocations] = useState([])
  const [vlans, setVlans] = useState([])
  const [filters, setFilters] = useState({ location_id: '', vlan_id: '', cable_type: '', status: '', q: '' })
  const [showModal, setShowModal] = useState(false)
  const [editConn, setEditConn] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({ portA: null, portB: null, cable_type: 'cat6', cable_color: '', cable_length_ft: '', vlan_id: '', status: 'active', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/connections?${params}`).then(r => setConnections(r.data))
  }

  useEffect(() => { load() }, [filters])
  useEffect(() => {
    api.get('/locations').then(r => setLocations(r.data))
    api.get('/vlans').then(r => setVlans(r.data))
  }, [])

  const openEdit = (conn) => {
    setEditConn(conn)
    setForm({
      portA: { id: conn.port_a_id, display: `${conn.device_a_name} / ${conn.port_a_label}` },
      portB: { id: conn.port_b_id, display: `${conn.device_b_name} / ${conn.port_b_label}` },
      cable_type: conn.cable_type,
      cable_color: conn.cable_color || '',
      cable_length_ft: conn.cable_length_ft || '',
      vlan_id: conn.vlan_id || '',
      status: conn.status,
      notes: conn.notes || '',
    })
    setShowModal(true)
  }

  const openAdd = () => {
    setEditConn(null)
    setForm({ portA: null, portB: null, cable_type: 'cat6', cable_color: '', cable_length_ft: '', vlan_id: '', status: 'active', notes: '' })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.portA?.id || !form.portB?.id) { setError('Select both ports'); return }
    setError(''); setSaving(true)
    try {
      const body = {
        port_a_id: form.portA.id,
        port_b_id: form.portB.id,
        cable_type: form.cable_type,
        cable_color: form.cable_color || null,
        cable_length_ft: form.cable_length_ft ? parseFloat(form.cable_length_ft) : null,
        vlan_id: form.vlan_id ? parseInt(form.vlan_id) : null,
        status: form.status,
        notes: form.notes || null,
      }
      if (editConn) await api.put(`/connections/${editConn.id}`, body)
      else await api.post('/connections', body)
      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await api.delete(`/connections/${id}`)
    setShowDelete(null)
    load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Connections</h1>
          <p className="text-sm text-gray-500 mt-0.5">{connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/connections/bulk" className="text-sm px-4 py-2 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h4M2 7h4M2 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 3h4M8 7h4M8 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Bulk Patch
          </Link>
          <button onClick={openAdd} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Add Connection
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
          placeholder="Search..." className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4] w-48"/>
        <select value={filters.location_id} onChange={e => setFilters(f => ({ ...f, location_id: e.target.value }))}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={filters.cable_type} onChange={e => setFilters(f => ({ ...f, cable_type: e.target.value }))}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All Cable Types</option>
          {CABLE_TYPES.map(t => <option key={t} value={t}>{CABLE_TYPE_LABELS[t]}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={filters.vlan_id} onChange={e => setFilters(f => ({ ...f, vlan_id: e.target.value }))}
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
          <option value="">All VLANs</option>
          {vlans.map(v => <option key={v.id} value={v.id}>VLAN {v.vlan_id} — {v.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2937] text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-3">From</th>
              <th className="text-left px-4 py-3">To</th>
              <th className="text-left px-4 py-3">Cable</th>
              <th className="text-left px-4 py-3">VLAN</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {connections.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-600">No connections found.</td></tr>
            ) : connections.map(c => (
              <tr key={c.id} className="hover:bg-[#1e1e1e] transition-colors cursor-pointer" onClick={() => openEdit(c)}>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{c.device_a_name}</div>
                  <div className="text-xs text-gray-500 font-mono">{c.port_a_label}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{c.device_b_name}</div>
                  <div className="text-xs text-gray-500 font-mono">{c.port_b_label}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CABLE_COLORS[c.cable_type] || '#6B7280' }}/>
                    <span className="text-gray-400 text-xs">{CABLE_TYPE_LABELS[c.cable_type]}</span>
                  </div>
                  {c.cable_length_ft && <div className="text-xs text-gray-600">{c.cable_length_ft}ft</div>}
                </td>
                <td className="px-4 py-3">
                  {c.vlan_name ? (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: c.vlan_color + '33', color: c.vlan_color }}>
                      {c.vlan_number} — {c.vlan_name}
                    </span>
                  ) : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs capitalize" style={{ color: STATUS_COLORS[c.status] }}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={e => { e.stopPropagation(); setShowDelete(c) }}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors p-1">
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editConn ? 'Edit Connection' : 'Add Connection'} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSave} className="space-y-4">
            <PortSearch label="Port A" value={form.portA} onChange={v => setForm(f => ({ ...f, portA: v }))}/>
            <PortSearch label="Port B" value={form.portB} onChange={v => setForm(f => ({ ...f, portB: v }))}/>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Cable Type</label>
                <select value={form.cable_type} onChange={e => setForm(f => ({ ...f, cable_type: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  {CABLE_TYPES.map(t => <option key={t} value={t}>{CABLE_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Cable Color</label>
                <input value={form.cable_color} onChange={e => setForm(f => ({ ...f, cable_color: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="blue"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Length (ft)</label>
                <input type="number" step="0.5" value={form.cable_length_ft} onChange={e => setForm(f => ({ ...f, cable_length_ft: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">VLAN</label>
                <select value={form.vlan_id} onChange={e => setForm(f => ({ ...f, vlan_id: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  <option value="">No VLAN</option>
                  {vlans.map(v => <option key={v.id} value={v.id}>VLAN {v.vlan_id} — {v.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows="2"
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4] resize-none"/>
              </div>
            </div>

            {/* Cable-trace photos — available once the connection exists */}
            {editConn ? (
              <div className="border-t border-[#1f2937] pt-4">
                <PhotoUploader entityType="connection" entityId={editConn.id} title="Cable / Trace Photos"/>
              </div>
            ) : (
              <p className="text-xs text-gray-600 border-t border-[#1f2937] pt-4">Save the connection first, then reopen it to attach cable-trace photos.</p>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : editConn ? 'Save Changes' : 'Add Connection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <Modal title="Delete Connection" onClose={() => setShowDelete(null)} size="sm">
          <p className="text-sm text-gray-400 mb-4">
            Delete connection between <strong className="text-white">{showDelete.device_a_name} / {showDelete.port_a_label}</strong> and <strong className="text-white">{showDelete.device_b_name} / {showDelete.port_b_label}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDelete(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={() => handleDelete(showDelete.id)} className="bg-[#EF4444] hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
