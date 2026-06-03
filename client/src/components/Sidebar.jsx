import { NavLink } from 'react-router-dom'
import api from '../utils/api'

const navItems = [
  { to: '/', label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>
  )},
  { to: '/devices', label: 'Devices', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.3"/><circle cx="4" cy="8" r="0.8" fill="currentColor"/><circle cx="7" cy="8" r="0.8" fill="currentColor"/></svg>
  )},
  { to: '/connections', label: 'Connections', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="13" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.3"/></svg>
  )},
  { to: '/racks', label: 'Racks', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.3"/><line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.1"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.1"/><line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.1"/></svg>
  )},
  { to: '/canvas', label: 'Canvas', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="11" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2"/><line x1="6.5" y1="6" x2="9.5" y2="10" stroke="currentColor" strokeWidth="1"/></svg>
  )},
  { to: '/photos', label: 'Photos', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1.2" stroke="currentColor" strokeWidth="1.1"/><path d="M2 12l3.5-3.5 2.5 2.5 3-3L14 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { to: '/templates', label: 'Templates', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.1"/><line x1="6" y1="6" x2="6" y2="14" stroke="currentColor" strokeWidth="1.1"/></svg>
  )},
  { to: '/vlans', label: 'VLANs', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="7" width="14" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="11" width="14" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.3"/></svg>
  )},
  { to: '/history', label: 'History', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { to: '/search', label: 'Search', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/><line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  )},
  { to: '/import', label: 'Import', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  )},
  { to: '/export', label: 'Export', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 10V2M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  )},
]

export default function Sidebar() {
  const handleLogout = async () => {
    await api.post('/auth/logout')
    window.location.href = '/login'
  }

  return (
    <aside className="w-52 bg-[#141414] border-r border-[#1f2937] flex flex-col h-full shrink-0">
      <div className="px-4 py-5 border-b border-[#1f2937]">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="3" cy="10" r="2" fill="#06B6D4"/>
            <circle cx="17" cy="10" r="2" fill="#06B6D4"/>
            <circle cx="10" cy="5" r="2" fill="#06B6D4"/>
            <line x1="5" y1="10" x2="8" y2="6" stroke="#06B6D4" strokeWidth="1.5"/>
            <line x1="12" y1="6" x2="15" y2="10" stroke="#06B6D4" strokeWidth="1.5"/>
            <line x1="5" y1="10" x2="15" y2="10" stroke="#374151" strokeWidth="1"/>
          </svg>
          <span className="font-semibold text-white text-sm tracking-wide">CableMap</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-[#06B6D4]/10 text-[#06B6D4]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e1e1e]'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-[#1f2937]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full px-2 py-1.5 rounded hover:bg-[#1e1e1e]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 12H2a1 1 0 01-1-1V3a1 1 0 011-1h3M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
