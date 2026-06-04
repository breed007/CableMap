import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Modal from './Modal'
import DeviceTypeIcon from './DeviceTypeIcon'
import { OUTLET_TYPES, OUTLET_TYPE_LABELS, DEVICE_TYPE_LABELS } from '../utils/cableColors'

const POWER_SOURCE_TYPES = ['ups', 'pdu']

export default function PowerSection({ device, onChange }) {
  const [devices, setDevices] = useState([])
  const [plugOutlet, setPlugOutlet] = useState(null)   // outlet object to plug a device into
  const [plugDeviceId, setPlugDeviceId] = useState('')
  const [plugWatts, setPlugWatts] = useState('')
  const [showFeed, setShowFeed] = useState(false)        // add-power-source modal
  const [feedSourceId, setFeedSourceId] = useState('')
  const [feedOutlets, setFeedOutlets] = useState([])
  const [feedOutletId, setFeedOutletId] = useState('')
  const [feedWatts, setFeedWatts] = useState('')
  const [showAddOutlets, setShowAddOutlets] = useState(false)
  const [outletForm, setOutletForm] = useState({ count: 8, prefix: 'Outlet ', outlet_type: 'nema_5_15', max_watts: '' })
  const [error, setError] = useState('')

  useEffect(() => { api.get('/devices').then(r => setDevices(r.data)) }, [])

  const isPowerSource = (device.outlets && device.outlets.length > 0) || POWER_SOURCE_TYPES.includes(device.device_type)
  const outlets = device.outlets || []
  const usedOutlets = outlets.filter(o => o.connected_device_id).length
  const totalWatts = outlets.reduce((s, o) => s + (o.connected_watts || 0), 0)
  const sources = devices.filter(d => POWER_SOURCE_TYPES.includes(d.device_type) && d.id !== device.id)

  const plugIn = async (e) => {
    e.preventDefault(); setError('')
    try {
      await api.post('/power/connections', { outlet_id: plugOutlet.id, device_id: parseInt(plugDeviceId), watts: plugWatts ? parseInt(plugWatts) : null })
      setPlugOutlet(null); setPlugDeviceId(''); setPlugWatts(''); onChange()
    } catch (err) { setError(err.response?.data?.error || 'Failed') }
  }

  const unplug = async (pcId) => { await api.delete(`/power/connections/${pcId}`); onChange() }

  const openFeed = () => { setShowFeed(true); setFeedSourceId(''); setFeedOutlets([]); setFeedOutletId(''); setFeedWatts(''); setError('') }
  const pickSource = async (sid) => {
    setFeedSourceId(sid); setFeedOutletId('')
    if (!sid) { setFeedOutlets([]); return }
    const r = await api.get(`/power/outlets?device_id=${sid}`)
    setFeedOutlets(r.data.filter(o => !o.connected_device_id))
  }
  const addFeed = async (e) => {
    e.preventDefault(); setError('')
    try {
      await api.post('/power/connections', { outlet_id: parseInt(feedOutletId), device_id: device.id, watts: feedWatts ? parseInt(feedWatts) : null })
      setShowFeed(false); onChange()
    } catch (err) { setError(err.response?.data?.error || 'Failed') }
  }

  const addOutlets = async (e) => {
    e.preventDefault()
    await api.post('/power/outlets/bulk-create', {
      device_id: device.id, count: parseInt(outletForm.count), prefix: outletForm.prefix,
      outlet_type: outletForm.outlet_type, max_watts: outletForm.max_watts ? parseInt(outletForm.max_watts) : null,
    })
    setShowAddOutlets(false); onChange()
  }

  return (
    <>
      {/* Power source: what feeds THIS device */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
          <h2 className="text-sm font-semibold text-white">Power Source <span className="text-gray-500 font-normal">({(device.power_feeds || []).length})</span></h2>
          <button onClick={openFeed} className="text-xs px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded transition-colors">+ Add Power Source</button>
        </div>
        {(device.power_feeds || []).length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-600">Not mapped to a UPS/PDU yet.</div>
        ) : (
          <div className="divide-y divide-[#1f2937]">
            {device.power_feeds.map(f => (
              <div key={f.power_connection_id} className="px-4 py-2.5 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                <Link to={`/devices/${f.source_device_id}`} className="text-[#06B6D4] hover:underline font-medium">{f.source_device_name}</Link>
                <span className="text-gray-500 font-mono text-xs">{f.outlet_label}</span>
                <span className="text-gray-600 text-xs">{OUTLET_TYPE_LABELS[f.outlet_type] || f.outlet_type}</span>
                {f.watts ? <span className="text-gray-500 text-xs">{f.watts}W</span> : null}
                <button onClick={() => unplug(f.power_connection_id)} className="ml-auto text-gray-600 hover:text-red-400 text-xs">unplug</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outlets: what this UPS/PDU provides */}
      {isPowerSource && (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-4">
          {/* Load / capacity bar */}
          {device.power?.capacity_watts ? (() => {
            const p = device.power
            const pct = Math.min(p.load_pct, 100)
            const barColor = p.overloaded ? '#EF4444' : p.load_pct >= 80 ? '#F59E0B' : '#22C55E'
            return (
              <div className="px-4 pt-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Load</span>
                  <span style={{ color: barColor }}>{p.connected_watts}W / {p.capacity_watts}W · {p.load_pct}%{p.overloaded ? ' — OVERLOADED' : ''}</span>
                </div>
                <div className="h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
              </div>
            )
          })() : null}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
            <h2 className="text-sm font-semibold text-white">
              Outlets <span className="text-gray-500 font-normal">({usedOutlets}/{outlets.length} used{totalWatts ? ` · ${totalWatts}W` : ''})</span>
            </h2>
            <button onClick={() => setShowAddOutlets(true)} className="text-xs px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded transition-colors">+ Add Outlets</button>
          </div>
          {outlets.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-600">No outlets. <button onClick={() => setShowAddOutlets(true)} className="text-[#06B6D4] hover:underline">Add some</button>.</div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outlets.map(o => (
                <div key={o.id} className={`flex items-center gap-2 px-3 py-2 rounded text-sm border ${o.connected_device_id ? 'bg-[#1e1e1e] border-[#374151]' : 'bg-[#1e1e1e] border-transparent'}`}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.connected_device_id ? '#22C55E' : '#6B7280' }} />
                  <span className="font-mono text-xs text-gray-300 shrink-0">{o.label}</span>
                  <span className="text-[10px] text-gray-600 shrink-0">{OUTLET_TYPE_LABELS[o.outlet_type] || o.outlet_type}</span>
                  {o.connected_device_id ? (
                    <>
                      <Link to={`/devices/${o.connected_device_id}`} className="text-[#06B6D4] hover:underline truncate ml-1">{o.connected_device_name}</Link>
                      <button onClick={() => unplug(o.power_connection_id)} className="ml-auto text-gray-600 hover:text-red-400 text-xs shrink-0">unplug</button>
                    </>
                  ) : (
                    <button onClick={() => { setPlugOutlet(o); setPlugDeviceId(''); setPlugWatts(''); setError('') }}
                      className="ml-auto text-[#06B6D4] hover:underline text-xs shrink-0">plug in</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plug a device into an outlet */}
      {plugOutlet && (
        <Modal title={`Plug into ${plugOutlet.label}`} onClose={() => setPlugOutlet(null)} size="sm">
          <form onSubmit={plugIn} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Device</label>
              <select required value={plugDeviceId} onChange={e => setPlugDeviceId(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                <option value="">-- choose a device --</option>
                {devices.filter(d => d.id !== device.id).map(d => <option key={d.id} value={d.id}>{d.name} ({DEVICE_TYPE_LABELS[d.device_type] || d.device_type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Estimated draw (W, optional)</label>
              <input type="number" value={plugWatts} onChange={e => setPlugWatts(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" placeholder="e.g. 35"/>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setPlugOutlet(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg">Plug In</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add a power source (feed) to this device */}
      {showFeed && (
        <Modal title="Add Power Source" onClose={() => setShowFeed(false)} size="sm">
          <form onSubmit={addFeed} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">UPS / PDU</label>
              <select required value={feedSourceId} onChange={e => pickSource(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                <option value="">-- choose a source --</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name} ({DEVICE_TYPE_LABELS[s.device_type]})</option>)}
              </select>
              {sources.length === 0 && <p className="text-xs text-gray-600 mt-1">No UPS/PDU devices yet. Add one first.</p>}
            </div>
            {feedSourceId && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Free outlet</label>
                <select required value={feedOutletId} onChange={e => setFeedOutletId(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  <option value="">-- choose an outlet --</option>
                  {feedOutlets.map(o => <option key={o.id} value={o.id}>{o.label} ({OUTLET_TYPE_LABELS[o.outlet_type] || o.outlet_type})</option>)}
                </select>
                {feedOutlets.length === 0 && <p className="text-xs text-amber-400 mt-1">That source has no free outlets.</p>}
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Estimated draw (W, optional)</label>
              <input type="number" value={feedWatts} onChange={e => setFeedWatts(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowFeed(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={!feedOutletId} className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">Add</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk add outlets */}
      {showAddOutlets && (
        <Modal title="Add Outlets" onClose={() => setShowAddOutlets(false)} size="sm">
          <form onSubmit={addOutlets} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Count</label>
                <input type="number" min="1" max="48" required value={outletForm.count} onChange={e => setOutletForm(f => ({ ...f, count: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Label prefix</label>
                <input value={outletForm.prefix} onChange={e => setOutletForm(f => ({ ...f, prefix: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Outlet type</label>
                <select value={outletForm.outlet_type} onChange={e => setOutletForm(f => ({ ...f, outlet_type: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4]">
                  {OUTLET_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Max watts (optional)</label>
                <input type="number" value={outletForm.max_watts} onChange={e => setOutletForm(f => ({ ...f, max_watts: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]"/>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddOutlets(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg">Add</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
