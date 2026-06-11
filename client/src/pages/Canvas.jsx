import { useEffect, useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { toPng } from 'html-to-image'
import api from '../utils/api'
import { CABLE_COLORS, CABLE_TYPE_LABELS, STATUS_DISPLAY } from '../utils/cableColors'
import DeviceTypeIcon from '../components/DeviceTypeIcon'

// ─── Themes ──────────────────────────────────────────────────────────────────

const THEMES = {
  dark:      { name: 'Dark',      bg: '#0a0a0a', grid: '#1f2937', nodeBg: '#141414', nodeBorder: '#1f2937', accent: '#06B6D4', variant: 'dots' },
  midnight:  { name: 'Midnight',  bg: '#0b1220', grid: '#1e293b', nodeBg: '#0f172a', nodeBorder: '#1e293b', accent: '#38bdf8', variant: 'dots' },
  blueprint: { name: 'Blueprint', bg: '#0a1929', grid: '#1e3a5f', nodeBg: '#0d2137', nodeBorder: '#1e3a5f', accent: '#7dd3fc', variant: 'lines' },
}

// ─── Device Node ─────────────────────────────────────────────────────────────

function DeviceNode({ data }) {
  const { device, ports, locationColor, theme } = data
  const t = theme || THEMES.dark
  const monitored = !!device.monitor_enabled
  const status = STATUS_DISPLAY[device.last_status] || STATUS_DISPLAY.unknown
  return (
    <div className="rounded-lg min-w-[160px] max-w-[240px] shadow-lg select-none"
      style={{
        background: t.nodeBg,
        border: `1px solid ${data.selected ? t.accent : t.nodeBorder}`,
        borderLeft: monitored ? `3px solid ${status.color}` : `1px solid ${t.nodeBorder}`,
      }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: t.nodeBorder }}>
        <span style={{ color: t.accent, display: 'inline-flex' }} className="shrink-0">
          <DeviceTypeIcon type={device.device_type} size={12}/>
        </span>
        <span className="text-white text-xs font-medium truncate">{device.name}</span>
        {monitored ? (
          <span className="ml-auto w-2 h-2 rounded-full shrink-0" title={status.label} style={{ backgroundColor: status.color }}/>
        ) : locationColor ? (
          <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: locationColor }}/>
        ) : null}
      </div>
      <div className="py-1">
        {ports.filter(p => !p.panel_side || p.panel_side === 'front').map((port) => (
          <div key={port.id} className="relative flex items-center px-3 py-0.5 group">
            <Handle type="source" position={Position.Left} id={`port-${port.id}-left`}
              style={{ width: 7, height: 7, background: port.is_connected ? '#22C55E' : '#374151', border: 'none', left: -3 }}/>
            <span className="text-xs font-mono text-gray-400 truncate group-hover:text-gray-200 transition-colors pl-2" style={{ fontSize: '10px' }}>
              {port.label}
            </span>
            <Handle type="target" position={Position.Right} id={`port-${port.id}-right`}
              style={{ width: 7, height: 7, background: port.is_connected ? '#22C55E' : '#374151', border: 'none', right: -3 }}/>
          </div>
        ))}
        {ports.length === 0 && <div className="px-3 py-1 text-xs text-gray-600">No ports</div>}
      </div>
    </div>
  )
}

const nodeTypes = { device: DeviceNode }

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [devices, setDevices] = useState([])
  const [connections, setConnections] = useState([])
  const [locations, setLocations] = useState([])
  const [vlans, setVlans] = useState([])
  const [filterLocation, setFilterLocation] = useState('')
  const [filterVlan, setFilterVlan] = useState('')
  const [themeKey, setThemeKey] = useState('dark')
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const rfInstance = useRef(null)
  const isMobile = window.innerWidth < 768
  const theme = THEMES[themeKey]

  const buildGraph = useCallback((devs, conns, locs, vlanFilter, locationFilter, thm) => {
    const locationMap = {}
    locs.forEach(l => { locationMap[l.id] = l })
    const t = THEMES[thm] || THEMES.dark

    const filteredDevs = locationFilter ? devs.filter(d => String(d.location_id) === String(locationFilter)) : devs
    const filteredDevIds = new Set(filteredDevs.map(d => d.id))

    const newNodes = filteredDevs.map(d => ({
      id: String(d.id),
      type: 'device',
      position: { x: d.canvas_x || Math.random() * 600, y: d.canvas_y || Math.random() * 400 },
      data: { device: d, ports: d.ports || [], locationColor: d.location_id ? locationMap[d.location_id]?.color : null, theme: t },
    }))

    const filteredConns = vlanFilter ? conns.filter(c => String(c.vlan_id) === String(vlanFilter)) : conns
    const newEdges = filteredConns
      .filter(c => filteredDevIds.has(c.device_a_id) && filteredDevIds.has(c.device_b_id))
      .map(c => {
        const color = CABLE_COLORS[c.cable_type] || '#6B7280'
        const dimmed = vlanFilter && String(c.vlan_id) !== String(vlanFilter)
        return {
          id: String(c.id), source: String(c.device_a_id), target: String(c.device_b_id),
          sourceHandle: `port-${c.port_a_id}-right`, targetHandle: `port-${c.port_b_id}-left`,
          label: c.vlan_name ? `VLAN ${c.vlan_number}` : (c.cable_color || CABLE_TYPE_LABELS[c.cable_type]),
          labelStyle: { fill: '#9CA3AF', fontSize: 10 }, labelBgStyle: { fill: t.bg, fillOpacity: 0.8 },
          style: { stroke: color, strokeWidth: 1.5, opacity: dimmed ? 0.2 : 1 },
          data: c, type: 'default',
        }
      })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [setNodes, setEdges])

  const load = useCallback(async () => {
    const [devsRes, connsRes, locsRes, vlansRes] = await Promise.all([
      api.get('/devices'), api.get('/connections'), api.get('/locations'), api.get('/vlans'),
    ])
    const fullDevices = await Promise.all(devsRes.data.map(d => api.get(`/devices/${d.id}`).then(r => r.data)))
    setDevices(fullDevices)
    setConnections(connsRes.data)
    setLocations(locsRes.data)
    setVlans(vlansRes.data)
    buildGraph(fullDevices, connsRes.data, locsRes.data, filterVlan, filterLocation, themeKey)
  }, [filterVlan, filterLocation, themeKey, buildGraph])

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (devices.length > 0) buildGraph(devices, connections, locations, filterVlan, filterLocation, themeKey)
  }, [filterVlan, filterLocation, themeKey])

  const onNodeDragStop = useCallback(async (_, node) => {
    try { await api.put(`/devices/${node.id}/position`, { canvas_x: node.position.x, canvas_y: node.position.y }) } catch {}
  }, [])

  const saveLayout = async () => {
    setSaving(true)
    try {
      await Promise.all(nodes.map(n => api.put(`/devices/${n.id}/position`, { canvas_x: n.position.x, canvas_y: n.position.y })))
      setSaveMsg('Layout saved'); setTimeout(() => setSaveMsg(''), 2000)
    } catch { setSaveMsg('Save failed') } finally { setSaving(false) }
  }

  const exportSvg = () => {
    const svgEl = document.querySelector('.react-flow__renderer svg')
    if (!svgEl) return
    const svgStr = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'cablemap-canvas.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  const exportPng = () => {
    if (rfInstance.current) rfInstance.current.fitView({ padding: 0.1 })
    setTimeout(() => {
      const el = document.querySelector('.react-flow')
      if (!el) return
      toPng(el, {
        backgroundColor: theme.bg, pixelRatio: 2,
        filter: (n) => !(n?.classList && (n.classList.contains('react-flow__minimap') || n.classList.contains('react-flow__controls') || n.classList.contains('react-flow__panel'))),
      }).then(dataUrl => {
        const a = document.createElement('a'); a.href = dataUrl; a.download = 'cablemap-canvas.png'; a.click()
      }).catch(() => {})
    }, 80)
  }

  // Layered auto-layout: roots (routers/firewalls/modems, else highest-degree)
  // on the left, BFS outward by connection, stacked vertically per layer.
  const autoLayout = () => {
    if (nodes.length === 0) return
    const adj = {}; nodes.forEach(n => { adj[n.id] = new Set() })
    edges.forEach(e => { adj[e.source]?.add(e.target); adj[e.target]?.add(e.source) })
    const rootTypes = new Set(['router', 'firewall', 'modem'])
    let roots = nodes.filter(n => rootTypes.has(n.data.device.device_type)).map(n => n.id)
    if (roots.length === 0) {
      roots = [nodes.slice().sort((a, b) => adj[b.id].size - adj[a.id].size)[0].id]
    }
    const layer = {}; const q = []
    roots.forEach(r => { layer[r] = 0; q.push(r) })
    while (q.length) { const id = q.shift(); for (const nb of adj[id]) { if (layer[nb] === undefined) { layer[nb] = layer[id] + 1; q.push(nb) } } }
    const maxLayer = Math.max(0, ...Object.values(layer))
    nodes.forEach(n => { if (layer[n.id] === undefined) layer[n.id] = maxLayer + 1 })
    const byLayer = {}; nodes.forEach(n => { (byLayer[layer[n.id]] ||= []).push(n.id) })
    const X_GAP = 320, Y_GAP = 130
    setNodes(nodes.map(n => {
      const L = layer[n.id]; const idx = byLayer[L].indexOf(n.id)
      return { ...n, position: { x: L * X_GAP + 60, y: idx * Y_GAP + 60 } }
    }))
  }

  if (isMobile) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">🖥️</div>
        <h2 className="text-lg font-semibold text-white mb-2">Canvas View</h2>
        <p className="text-sm text-gray-500">The canvas is optimized for desktop. Please use a larger screen.</p>
      </div>
    )
  }

  const btn = "bg-[#141414] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-[#374151] transition-colors"

  return (
    <div style={{ height: '100vh', width: '100%', background: theme.bg }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeDragStop={onNodeDragStop}
        onEdgeClick={(_, edge) => setSelectedEdge(edge.data)} onPaneClick={() => setSelectedEdge(null)}
        nodeTypes={nodeTypes} fitView onInit={inst => { rfInstance.current = inst }}
        style={{ background: theme.bg }} defaultEdgeOptions={{ type: 'default' }}
      >
        <Background color={theme.grid} gap={24} size={1} variant={theme.variant}/>
        <Controls style={{ bottom: 24, left: 16 }}/>
        <MiniMap nodeColor={theme.nodeBg} maskColor="rgba(0,0,0,0.6)" style={{ bottom: 24, right: 16 }}/>

        <Panel position="top-left" className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-[#141414] border border-[#1f2937] rounded-lg px-3 py-1.5">
            <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="bg-transparent text-gray-400 text-xs focus:outline-none">
              <option value="">All Locations</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#141414] border border-[#1f2937] rounded-lg px-3 py-1.5">
            <select value={filterVlan} onChange={e => setFilterVlan(e.target.value)} className="bg-transparent text-gray-400 text-xs focus:outline-none">
              <option value="">All VLANs</option>
              {vlans.map(v => <option key={v.id} value={v.id}>VLAN {v.vlan_id} — {v.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#141414] border border-[#1f2937] rounded-lg px-3 py-1.5">
            <select value={themeKey} onChange={e => setThemeKey(e.target.value)} className="bg-transparent text-gray-400 text-xs focus:outline-none" title="Canvas theme">
              {Object.entries(THEMES).map(([k, t]) => <option key={k} value={k}>{t.name}</option>)}
            </select>
          </div>
          <button onClick={autoLayout} className={btn}>Auto Layout</button>
          <button onClick={saveLayout} disabled={saving} className={`${btn} disabled:opacity-50`}>{saving ? 'Saving…' : saveMsg || 'Save Layout'}</button>
          <button onClick={exportPng} className={btn}>Export PNG</button>
          <button onClick={exportSvg} className={btn}>Export SVG</button>
        </Panel>

        <Panel position="top-right">
          <div className="bg-[#141414] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-gray-500 space-y-0.5">
            <div>{nodes.length} devices · {edges.length} connections</div>
          </div>
        </Panel>

        {selectedEdge && (
          <Panel position="bottom-left">
            <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-3 text-sm max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Connection</span>
                <button onClick={() => setSelectedEdge(null)} className="text-gray-600 hover:text-white text-lg leading-none">&times;</button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CABLE_COLORS[selectedEdge.cable_type] }}/>
                <span className="text-white font-medium">{selectedEdge.device_a_name}</span>
                <span className="text-gray-500 font-mono text-xs">{selectedEdge.port_a_label}</span>
              </div>
              <div className="flex items-center gap-2 ml-5 mb-2">
                <span className="text-gray-600">→</span>
                <span className="text-white font-medium">{selectedEdge.device_b_name}</span>
                <span className="text-gray-500 font-mono text-xs">{selectedEdge.port_b_label}</span>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <div>{CABLE_TYPE_LABELS[selectedEdge.cable_type]}{selectedEdge.cable_length_ft ? ` · ${selectedEdge.cable_length_ft}ft` : ''}</div>
                {selectedEdge.vlan_name && (
                  <div className="px-1.5 py-0.5 rounded inline-block" style={{ backgroundColor: selectedEdge.vlan_color + '33', color: selectedEdge.vlan_color }}>
                    VLAN {selectedEdge.vlan_number} — {selectedEdge.vlan_name}
                  </div>
                )}
                {selectedEdge.notes && <div className="text-gray-600">{selectedEdge.notes}</div>}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
