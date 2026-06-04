import { useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import Modal from '../components/Modal'
import DeviceTypeIcon from '../components/DeviceTypeIcon'
import PhotoUploader from '../components/PhotoUploader'
import DocumentUploader from '../components/DocumentUploader'
import { DEVICE_TYPE_LABELS, PORT_TYPE_LABELS, SPEED_LABELS, FORM_FACTORS } from '../utils/cableColors'

const DEVICE_TYPES = ['switch','patch_panel','wall_plate','router','nas','access_point','server','firewall','modem','media_converter','ups','pdu','shelf','blank','other']
const PORT_TYPES = ['rj45','sfp','sfp_plus','qsfp','lc_fiber','sc_fiber','usb_a','usb_c','other']
const SPEEDS = ['100m','1g','2_5g','5g','10g','25g','40g','100g','unknown']

const VENDOR_ORDER = [
  'Ubiquiti','TP-Link Omada','MikroTik','Netgear','Aruba Instant On','Cisco',
  'Fortinet','Palo Alto Networks','Cisco Meraki','Netgate','OPNsense','Sophos','SonicWall','Firewalla','Protectli',
  'Synology','QNAP','TrueNAS','Asustor','UGREEN','Drobo','Custom',
  'HP','APC','CyberPower','Eaton','Tripp Lite','Vertiv','Generic',
]

const blankForm = () => ({
  make: '', model: '', device_type: 'switch', os: '', form_factor: 'rackmount',
  rack_unit_height: 1, notes: '', product_url: '', datasheet_url: '',
  ports: [], // individual port objects: { label, port_type, speed, is_uplink }
})

const blankQuickAdd = () => ({ count: 24, prefix: 'Port ', port_type: 'rj45', speed: '1g' })

// Expand a quick-add group spec into individual port objects
function expandGroup(g, startIndex = 1) {
  const out = []
  const count = Math.max(0, parseInt(g.count) || 0)
  for (let i = 0; i < count; i++) {
    out.push({ label: `${g.prefix || 'Port '}${startIndex + i}`, port_type: g.port_type, speed: g.speed, is_uplink: 0 })
  }
  return out
}

// Renumber ports sequentially for persistence
function renumber(ports) {
  return ports.map((p, i) => ({
    label: p.label || `Port ${i + 1}`,
    port_number: i + 1,
    port_type: p.port_type || 'rj45',
    speed: p.speed || 'unknown',
    is_uplink: p.is_uplink ? 1 : 0,
  }))
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [search, setSearch] = useState('')
  const [showCustomOnly, setShowCustomOnly] = useState(false)
  const [editing, setEditing] = useState(null) // null | {} (new) | template (edit)
  const [form, setForm] = useState(blankForm())
  const [quick, setQuick] = useState(blankQuickAdd())
  const [savedId, setSavedId] = useState(null) // id of just-saved custom template (for attachments)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(null)

  const load = useCallback(() => {
    api.get('/device-templates').then(r => setTemplates(r.data))
  }, [])
  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing({}); setForm(blankForm()); setQuick(blankQuickAdd()); setSavedId(null); setError('') }
  const openEdit = (t) => {
    setEditing(t)
    setSavedId(t.is_custom ? t.id : null)
    setQuick(blankQuickAdd())
    setForm({
      make: t.make || '', model: t.model || '', device_type: t.device_type, os: t.os || '',
      form_factor: t.form_factor || (t.rack_unit_height ? 'rackmount' : 'other'),
      rack_unit_height: t.rack_unit_height || 1, notes: t.notes || '',
      product_url: t.product_url || '', datasheet_url: t.datasheet_url || '',
      // Load the actual saved ports so each one is individually editable.
      ports: (t.default_ports || []).map(p => ({
        label: p.label, port_type: p.port_type, speed: p.speed, is_uplink: p.is_uplink ? 1 : 0,
      })),
    })
    setError('')
  }

  const save = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const isRack = form.form_factor === 'rackmount'
      const body = {
        make: form.make || 'Custom',
        model: form.model,
        device_type: form.device_type,
        os: form.os || null,
        form_factor: form.form_factor,
        rack_unit_height: isRack ? (parseInt(form.rack_unit_height) || 1) : null,
        notes: form.notes || null,
        product_url: form.product_url || null,
        datasheet_url: form.datasheet_url || null,
        // The edited per-port list is the source of truth (renumbered on save).
        default_ports: renumber(form.ports || []),
      }
      let res
      if (editing && editing.id) res = await api.put(`/device-templates/${editing.id}`, body)
      else res = await api.post('/device-templates', body)
      setSavedId(res.data.id)
      setEditing(res.data) // switch to edit mode so attachments can be added
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  const doDelete = async (t) => {
    await api.delete(`/device-templates/${t.id}`)
    setShowDelete(null)
    if (editing && editing.id === t.id) setEditing(null)
    load()
  }

  const filtered = templates.filter(t => {
    if (showCustomOnly && !t.is_custom) return false
    if (!search) return true
    const q = search.toLowerCase()
    return [t.make, t.model, t.sku, t.device_type, t.os].some(v => (v || '').toLowerCase().includes(q))
  })

  const makes = [...new Set(filtered.map(t => t.make))].sort((a, b) => {
    const ia = VENDOR_ORDER.indexOf(a), ib = VENDOR_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
  })

  // ── Per-port editing ──────────────────────────────────────────────────────
  const updatePort = (i, patch) => setForm(f => ({ ...f, ports: f.ports.map((p, idx) => idx === i ? { ...p, ...patch } : p) }))
  const removePort = (i) => setForm(f => ({ ...f, ports: f.ports.filter((_, idx) => idx !== i) }))
  const movePort = (i, dir) => setForm(f => {
    const next = [...f.ports]
    const j = i + dir
    if (j < 0 || j >= next.length) return f
    ;[next[i], next[j]] = [next[j], next[i]]
    return { ...f, ports: next }
  })
  const addSinglePort = () => setForm(f => ({
    ...f,
    ports: [...f.ports, { label: `Port ${f.ports.length + 1}`, port_type: 'rj45', speed: '1g', is_uplink: 0 }],
  }))
  const addGroup = () => setForm(f => ({ ...f, ports: [...f.ports, ...expandGroup(quick, f.ports.length + 1)] }))

  const totalPorts = (form.ports || []).length

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{templates.length} models · {templates.filter(t => t.is_custom).length} custom</p>
        </div>
        <button onClick={openNew} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> New Custom Template
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search make, model, SKU…"
          className="bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4] w-64"/>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" checked={showCustomOnly} onChange={e => setShowCustomOnly(e.target.checked)} className="rounded"/>
          Custom only
        </label>
      </div>

      <div className="space-y-5">
        {makes.map(make => (
          <div key={make}>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{make}</div>
            <div className="bg-[#141414] border border-[#1f2937] rounded-lg divide-y divide-[#1f2937]">
              {filtered.filter(t => t.make === make).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#1e1e1e] transition-colors">
                  <DeviceTypeIcon type={t.device_type} size={14} className="text-gray-400 shrink-0"/>
                  <span className="text-white font-medium">{t.model}</span>
                  <span className="text-xs text-gray-600 font-mono">{t.sku}</span>
                  {t.is_custom ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#06B6D4]/15 text-[#06B6D4]">CUSTOM</span> : null}
                  <span className="text-xs text-gray-500 ml-auto">{DEVICE_TYPE_LABELS[t.device_type] || t.device_type}</span>
                  <span className="text-xs text-gray-600 w-20 text-right">{t.rack_unit_height ? `${t.rack_unit_height}U` : (t.form_factor || '—')}</span>
                  <span className="text-xs text-gray-600 w-14 text-right">{t.default_ports.length} ports</span>
                  {t.is_custom ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEdit(t)} className="text-xs text-gray-400 hover:text-white">Edit</button>
                      <button onClick={() => setShowDelete(t)} className="text-xs text-gray-600 hover:text-red-400">Delete</button>
                    </div>
                  ) : (
                    <button onClick={() => openEdit(t)} className="text-xs text-gray-500 hover:text-gray-300 shrink-0">View</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {makes.length === 0 && <div className="text-sm text-gray-600 px-4 py-8 text-center">No templates match.</div>}
      </div>

      {/* Editor modal */}
      {editing && (
        <Modal title={editing.id ? (editing.is_custom ? 'Edit Custom Template' : 'Template (read-only)') : 'New Custom Template'} onClose={() => setEditing(null)} size="lg">
          {editing.id && !editing.is_custom && (
            <div className="mb-4 text-xs text-amber-300 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded px-3 py-2">
              This is a built-in reference template and can't be edited. Use “New Custom Template” to create your own.
            </div>
          )}
          <form onSubmit={save} className="space-y-4">
            <fieldset disabled={editing.id && !editing.is_custom} className="space-y-4 disabled:opacity-60">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Manufacturer</label>
                  <input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="Custom"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Model <span className="text-red-400">*</span></label>
                  <input required value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Device type</label>
                  <input list="device-types" value={form.device_type} onChange={e => setForm(f => ({ ...f, device_type: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="switch, or type a custom one"/>
                  <datalist id="device-types">{DEVICE_TYPES.map(t => <option key={t} value={t}>{DEVICE_TYPE_LABELS[t]}</option>)}</datalist>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">OS / Firmware</label>
                  <input value={form.os} onChange={e => setForm(f => ({ ...f, os: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="FortiOS, DSM 7.2, etc."/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Form factor</label>
                  <select value={form.form_factor} onChange={e => setForm(f => ({ ...f, form_factor: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                    {FORM_FACTORS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                {form.form_factor === 'rackmount' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Rack height (U)</label>
                    <input type="number" min="1" max="12" value={form.rack_unit_height} onChange={e => setForm(f => ({ ...f, rack_unit_height: e.target.value }))}
                      className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Product page URL</label>
                  <input value={form.product_url} onChange={e => setForm(f => ({ ...f, product_url: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white font-mono text-xs focus:outline-none focus:border-[#06B6D4]" placeholder="https://…"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Datasheet / specs URL</label>
                  <input value={form.datasheet_url} onChange={e => setForm(f => ({ ...f, datasheet_url: e.target.value }))}
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white font-mono text-xs focus:outline-none focus:border-[#06B6D4]" placeholder="https://…"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows="2"
                    className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-[#06B6D4]"/>
                </div>
              </div>

              {/* Port editor */}
              {(!editing.id || editing.is_custom) && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    Ports <span className="text-gray-600">— {totalPorts} total</span>
                  </label>

                  {/* Quick add: append a run of identical ports */}
                  <div className="flex flex-wrap gap-2 items-center mb-2 bg-[#0d0d0d] border border-[#1f2937] rounded p-2">
                    <span className="text-[11px] text-gray-500">Quick add</span>
                    <input type="number" min="1" value={quick.count} onChange={e => setQuick(q => ({ ...q, count: e.target.value }))}
                      className="w-14 bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1 text-sm text-white" title="How many"/>
                    <input value={quick.prefix} onChange={e => setQuick(q => ({ ...q, prefix: e.target.value }))}
                      className="w-24 bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1 text-sm text-white" title="Label prefix"/>
                    <select value={quick.port_type} onChange={e => setQuick(q => ({ ...q, port_type: e.target.value }))}
                      className="bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1 text-sm text-gray-300">
                      {PORT_TYPES.map(t => <option key={t} value={t}>{PORT_TYPE_LABELS[t]}</option>)}
                    </select>
                    <select value={quick.speed} onChange={e => setQuick(q => ({ ...q, speed: e.target.value }))}
                      className="bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1 text-sm text-gray-300">
                      {SPEEDS.map(s => <option key={s} value={s}>{SPEED_LABELS[s]}</option>)}
                    </select>
                    <button type="button" onClick={addGroup} className="text-xs px-2 py-1 bg-[#06B6D4]/15 text-[#06B6D4] rounded hover:bg-[#06B6D4]/25">Append</button>
                  </div>

                  {/* Editable per-port list */}
                  {totalPorts === 0 ? (
                    <div className="text-xs text-gray-600 px-1 py-2">No ports. Use Quick add above or “+ Add port”. (Zero ports is fine for UPS, shelves, blanks.)</div>
                  ) : (
                    <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                      {form.ports.map((p, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-[10px] font-mono text-gray-600 w-6 text-right shrink-0">{i + 1}</span>
                          <input value={p.label} onChange={e => updatePort(i, { label: e.target.value })}
                            className="flex-1 min-w-0 bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-white font-mono" title="Label"/>
                          <select value={p.port_type} onChange={e => updatePort(i, { port_type: e.target.value })}
                            className="bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300 shrink-0">
                            {PORT_TYPES.map(t => <option key={t} value={t}>{PORT_TYPE_LABELS[t]}</option>)}
                          </select>
                          <select value={p.speed} onChange={e => updatePort(i, { speed: e.target.value })}
                            className="bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300 shrink-0">
                            {SPEEDS.map(s => <option key={s} value={s}>{SPEED_LABELS[s]}</option>)}
                          </select>
                          <label className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0" title="Uplink port">
                            <input type="checkbox" checked={!!p.is_uplink} onChange={e => updatePort(i, { is_uplink: e.target.checked ? 1 : 0 })} className="rounded"/>
                            UL
                          </label>
                          <button type="button" onClick={() => movePort(i, -1)} disabled={i === 0}
                            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 text-xs shrink-0" title="Move up">▲</button>
                          <button type="button" onClick={() => movePort(i, 1)} disabled={i === form.ports.length - 1}
                            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 text-xs shrink-0" title="Move down">▼</button>
                          <button type="button" onClick={() => removePort(i)} className="text-gray-600 hover:text-red-400 text-sm shrink-0" title="Remove">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={addSinglePort} className="mt-2 text-xs text-[#06B6D4] hover:underline">+ Add port</button>
                </div>
              )}

              {/* Read-only port list for built-in templates */}
              {editing.id && !editing.is_custom && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Ports <span className="text-gray-600">— {(editing.default_ports || []).length} total</span></label>
                  <div className="max-h-60 overflow-y-auto bg-[#0d0d0d] border border-[#1f2937] rounded p-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    {(editing.default_ports || []).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-gray-300 truncate">{p.label}</span>
                        <span className="text-gray-600 ml-auto shrink-0">{PORT_TYPE_LABELS[p.port_type] || p.port_type} · {SPEED_LABELS[p.speed] || p.speed}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>

            {error && <p className="text-xs text-red-400">{error}</p>}

            {(!editing.id || editing.is_custom) && (
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Close</button>
                <button type="submit" disabled={saving} className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
                  {saving ? 'Saving…' : editing.id ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            )}
          </form>

          {/* Attachments — only after the custom template exists */}
          {savedId ? (
            <div className="mt-5 pt-5 border-t border-[#1f2937] space-y-5">
              <PhotoUploader entityType="template" entityId={savedId} title="Template Photo"/>
              <DocumentUploader entityType="template" entityId={savedId} title="Spec Sheet / Visio Stencil"/>
            </div>
          ) : (!editing.id && (
            <p className="mt-4 text-xs text-gray-600">Create the template first, then a photo + spec-sheet/Visio uploader will appear here.</p>
          ))}
        </Modal>
      )}

      {showDelete && (
        <Modal title="Delete Custom Template" onClose={() => setShowDelete(null)} size="sm">
          <p className="text-sm text-gray-400 mb-4">Delete <strong className="text-white">{showDelete.make} {showDelete.model}</strong>? Existing devices created from it are unaffected.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDelete(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={() => doDelete(showDelete)} className="bg-[#EF4444] hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
