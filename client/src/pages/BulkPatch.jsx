import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { CABLE_TYPE_LABELS } from '../utils/cableColors'

const CABLE_TYPES = ['cat5e','cat6','cat6a','cat7','cat8','om3_fiber','os2_fiber','dac','other']
const STATUSES = ['active','inactive','planned','unknown']

function DeviceSide({ label, devices, deviceId, setDeviceId, ports, fromIdx, setFromIdx, toIdx, setToIdx, showRange }) {
  return (
    <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{label}</div>
      <select value={deviceId} onChange={e => setDeviceId(e.target.value)}
        className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#06B6D4] mb-3">
        <option value="">-- choose a device --</option>
        {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      {ports.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">{showRange ? 'From port' : 'Start port'}</label>
            <select value={fromIdx} onChange={e => setFromIdx(parseInt(e.target.value))}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300">
              {ports.map((p, i) => <option key={p.id} value={i}>{p.label}{p.is_connected ? ' (in use)' : ''}</option>)}
            </select>
          </div>
          {showRange && (
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">To port</label>
              <select value={toIdx} onChange={e => setToIdx(parseInt(e.target.value))}
                className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300">
                {ports.map((p, i) => <option key={p.id} value={i}>{p.label}{p.is_connected ? ' (in use)' : ''}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BulkPatch() {
  const navigate = useNavigate()
  const [devices, setDevices] = useState([])
  const [vlans, setVlans] = useState([])
  const [aId, setAId] = useState(''); const [aPorts, setAPorts] = useState([])
  const [bId, setBId] = useState(''); const [bPorts, setBPorts] = useState([])
  const [aFrom, setAFrom] = useState(0); const [aTo, setATo] = useState(0)
  const [bStart, setBStart] = useState(0)
  const [reverse, setReverse] = useState(false)
  const [skipInUse, setSkipInUse] = useState(true)
  const [opts, setOpts] = useState({ cable_type: 'cat6', cable_color: '', cable_length_ft: '', vlan_id: '', status: 'active' })
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/devices').then(r => setDevices(r.data))
    api.get('/vlans').then(r => setVlans(r.data))
  }, [])

  useEffect(() => {
    if (!aId) { setAPorts([]); return }
    api.get(`/devices/${aId}`).then(r => { setAPorts(r.data.ports); setAFrom(0); setATo(Math.min(r.data.ports.length - 1, 23)) })
  }, [aId])
  useEffect(() => {
    if (!bId) { setBPorts([]); return }
    api.get(`/devices/${bId}`).then(r => { setBPorts(r.data.ports); setBStart(0) })
  }, [bId])

  // Build the pairing preview
  const pairs = []
  if (aPorts.length && bPorts.length && aTo >= aFrom) {
    for (let k = 0; k + aFrom <= aTo; k++) {
      const aPort = aPorts[aFrom + k]
      const bIdx = reverse ? bStart - k : bStart + k
      const bPort = bPorts[bIdx]
      if (!aPort || !bPort) break
      const inUse = aPort.is_connected || bPort.is_connected
      pairs.push({ aPort, bPort, inUse })
    }
  }
  const toCreate = pairs.filter(p => !(skipInUse && p.inUse))

  const submit = async () => {
    setError(''); setSaving(true); setResult(null)
    try {
      const connections = toCreate.map(p => ({
        port_a_id: p.aPort.id, port_b_id: p.bPort.id,
        cable_type: opts.cable_type, cable_color: opts.cable_color || null,
        cable_length_ft: opts.cable_length_ft ? parseFloat(opts.cable_length_ft) : null,
        vlan_id: opts.vlan_id ? parseInt(opts.vlan_id) : null, status: opts.status,
      }))
      if (connections.length === 0) { setError('No connections to create'); setSaving(false); return }
      const res = await api.post('/connections/bulk', { connections })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk patch failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Bulk Patch</h1>
          <p className="text-sm text-gray-500 mt-0.5">Patch a range of ports between two devices in one shot.</p>
        </div>
        <button onClick={() => navigate('/connections')} className="text-sm text-gray-400 hover:text-white">← Connections</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <DeviceSide label="Side A" devices={devices} deviceId={aId} setDeviceId={setAId} ports={aPorts}
          fromIdx={aFrom} setFromIdx={setAFrom} toIdx={aTo} setToIdx={setATo} showRange />
        <DeviceSide label="Side B" devices={devices.filter(d => String(d.id) !== aId)} deviceId={bId} setDeviceId={setBId} ports={bPorts}
          fromIdx={bStart} setFromIdx={setBStart} toIdx={0} setToIdx={() => {}} showRange={false} />
      </div>

      {/* Options */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Cable type</label>
            <select value={opts.cable_type} onChange={e => setOpts(o => ({ ...o, cable_type: e.target.value }))}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300">
              {CABLE_TYPES.map(t => <option key={t} value={t}>{CABLE_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Color</label>
            <input value={opts.cable_color} onChange={e => setOpts(o => ({ ...o, cable_color: e.target.value }))}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-white" placeholder="blue"/>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Length (ft)</label>
            <input type="number" value={opts.cable_length_ft} onChange={e => setOpts(o => ({ ...o, cable_length_ft: e.target.value }))}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"/>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">VLAN</label>
            <select value={opts.vlan_id} onChange={e => setOpts(o => ({ ...o, vlan_id: e.target.value }))}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300">
              <option value="">None</option>
              {vlans.map(v => <option key={v.id} value={v.id}>VLAN {v.vlan_id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Status</label>
            <select value={opts.status} onChange={e => setOpts(o => ({ ...o, status: e.target.value }))}
              className="w-full bg-[#1e1e1e] border border-[#374151] rounded px-2 py-1.5 text-sm text-gray-300 capitalize">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-3">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input type="checkbox" checked={reverse} onChange={e => setReverse(e.target.checked)} className="rounded"/> Reverse Side B order
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input type="checkbox" checked={skipInUse} onChange={e => setSkipInUse(e.target.checked)} className="rounded"/> Skip ports already in use
          </label>
        </div>
      </div>

      {/* Preview */}
      {pairs.length > 0 && !result && (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Preview</span>
            <span className="text-xs text-gray-500">{toCreate.length} to create{pairs.length - toCreate.length > 0 ? ` · ${pairs.length - toCreate.length} skipped` : ''}</span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-[#1f2937]">
            {pairs.map((p, i) => {
              const skipped = skipInUse && p.inUse
              return (
                <div key={i} className={`px-4 py-2 flex items-center gap-3 text-sm ${skipped ? 'opacity-40' : ''}`}>
                  <span className="font-mono text-xs text-gray-300 w-28 truncate">{p.aPort.label}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-600 shrink-0"><line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2"/><path d="M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span className="font-mono text-xs text-gray-300 w-28 truncate">{p.bPort.label}</span>
                  {p.inUse && <span className={`text-[10px] ml-auto ${skipped ? 'text-gray-500' : 'text-amber-400'}`}>{skipped ? 'skipped (in use)' : 'in use — will error'}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-400 mb-4 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</div>}

      {/* Result */}
      {result ? (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4">
          <div className="text-sm font-semibold text-white mb-3">Patch complete</div>
          <div className="flex gap-6 mb-3">
            <div><div className="text-2xl font-bold text-green-400">{result.created}</div><div className="text-xs text-gray-500">Created</div></div>
            <div><div className="text-2xl font-bold text-red-400">{result.errors.length}</div><div className="text-xs text-gray-500">Errors</div></div>
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1 mb-3">
              {result.errors.map((e, i) => <div key={i} className="text-xs bg-[#1e1e1e] rounded px-3 py-1.5 text-red-400">Row {e.index + 1}: {e.error}</div>)}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => navigate('/connections')} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white text-sm font-medium px-4 py-2 rounded-lg">View Connections</button>
            <button onClick={() => { setResult(null); setAId(''); setBId('') }} className="text-sm text-gray-400 hover:text-white px-2">Patch more</button>
          </div>
        </div>
      ) : (
        <button onClick={submit} disabled={saving || toCreate.length === 0}
          className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {saving ? 'Patching…' : `Create ${toCreate.length} Connection${toCreate.length !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  )
}
