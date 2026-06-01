import { useEffect, useState } from 'react'
import api from '../utils/api'
import Modal from '../components/Modal'

export default function VlanManager() {
  const [vlans, setVlans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editVlan, setEditVlan] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [selectedVlan, setSelectedVlan] = useState(null)
  const [vlanConns, setVlanConns] = useState([])
  const [form, setForm] = useState({ vlan_id: '', name: '', description: '', color: '#6B7280' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get('/vlans').then(r => setVlans(r.data))
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditVlan(null)
    setForm({ vlan_id: '', name: '', description: '', color: '#6B7280' })
    setShowModal(true)
  }

  const openEdit = (v) => {
    setEditVlan(v)
    setForm({ vlan_id: v.vlan_id, name: v.name, description: v.description || '', color: v.color || '#6B7280' })
    setShowModal(true)
  }

  const openVlanConnections = async (v) => {
    setSelectedVlan(v)
    const res = await api.get(`/vlans/${v.id}/connections`)
    setVlanConns(res.data)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const body = { ...form, vlan_id: parseInt(form.vlan_id) }
      if (editVlan) await api.put(`/vlans/${editVlan.id}`, body)
      else await api.post('/vlans', body)
      setShowModal(false)
      load()
      if (selectedVlan) openVlanConnections(selectedVlan)
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (v) => {
    await api.delete(`/vlans/${v.id}`)
    setShowDelete(null)
    if (selectedVlan?.id === v.id) setSelectedVlan(null)
    load()
  }

  const PRESET_COLORS = ['#6B7280','#3B82F6','#06B6D4','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316']

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">VLAN Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vlans.length} VLAN{vlans.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add VLAN
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VLAN list */}
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f2937] text-xs text-gray-500 uppercase tracking-wide">VLANs</div>
          {vlans.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-600">No VLANs configured.</div>
          ) : (
            <div className="divide-y divide-[#1f2937]">
              {vlans.map(v => (
                <div key={v.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedVlan?.id === v.id ? 'bg-[#1e1e1e]' : 'hover:bg-[#1a1a1a]'}`}
                  onClick={() => openVlanConnections(v)}>
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: v.color }}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500 w-12 shrink-0">VLAN {v.vlan_id}</span>
                      <span className="text-sm text-white font-medium truncate">{v.name}</span>
                    </div>
                    {v.description && <div className="text-xs text-gray-600 truncate mt-0.5">{v.description}</div>}
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">{v.connection_count} conn{v.connection_count !== 1 ? 's' : ''}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); openEdit(v) }}
                      className="text-xs text-gray-600 hover:text-[#06B6D4] transition-colors p-1">edit</button>
                    <button onClick={e => { e.stopPropagation(); setShowDelete(v) }}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors p-1">&times;</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VLAN connections panel */}
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg overflow-hidden">
          {selectedVlan ? (
            <>
              <div className="px-4 py-3 border-b border-[#1f2937] flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: selectedVlan.color }}/>
                <span className="text-sm font-semibold text-white">VLAN {selectedVlan.vlan_id} — {selectedVlan.name}</span>
              </div>
              {vlanConns.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-600 text-center">No connections on this VLAN</div>
              ) : (
                <div className="divide-y divide-[#1f2937]">
                  {vlanConns.map(c => (
                    <div key={c.id} className="px-4 py-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white truncate">{c.device_a_name}</span>
                        <span className="text-gray-500 font-mono text-xs shrink-0">{c.port_a_label}</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-600 shrink-0"><line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        <span className="text-white truncate">{c.device_b_name}</span>
                        <span className="text-gray-500 font-mono text-xs shrink-0">{c.port_b_label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-600">Select a VLAN to see its connections</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editVlan ? 'Edit VLAN' : 'Add VLAN'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">VLAN ID (1–4094) <span className="text-red-400">*</span></label>
                <input required type="number" min="1" max="4094" value={form.vlan_id}
                  onChange={e => setForm(f => ({ ...f, vlan_id: e.target.value }))}
                  disabled={!!editVlan}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#06B6D4] disabled:opacity-50"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Name <span className="text-red-400">*</span></label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"
                  placeholder="Management"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"
                  placeholder="Network management devices"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }}/>
                  ))}
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-7 h-7 rounded-full cursor-pointer bg-transparent border border-[#374151]"/>
                </div>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : editVlan ? 'Save Changes' : 'Add VLAN'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {showDelete && (
        <Modal title="Delete VLAN" onClose={() => setShowDelete(null)} size="sm">
          <p className="text-sm text-gray-400 mb-4">
            Delete <strong className="text-white">VLAN {showDelete.vlan_id} — {showDelete.name}</strong>?
            Connections assigned to this VLAN will have their VLAN cleared.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDelete(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={() => handleDelete(showDelete)} className="bg-[#EF4444] hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
