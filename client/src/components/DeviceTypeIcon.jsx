export default function DeviceTypeIcon({ type, size = 16, className = '' }) {
  const s = size
  const icons = {
    switch: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="1" y="4" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        {[3,5,7,9,11,13].map(x => (
          <circle key={x} cx={x} cy="8" r="0.8" fill="currentColor"/>
        ))}
      </svg>
    ),
    patch_panel: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        {[3,5,7,9,11,13].map(x => (
          <rect key={x} x={x-0.8} y="6" width="1.6" height="4" rx="0.4" fill="currentColor"/>
        ))}
      </svg>
    ),
    router: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="5" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="8" y1="5" x2="8" y2="2" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="5" y1="2" x2="11" y2="2" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="5" cy="8.5" r="1" fill="currentColor"/>
        <circle cx="8" cy="8.5" r="1" fill="currentColor"/>
        <circle cx="11" cy="8.5" r="1" fill="currentColor"/>
      </svg>
    ),
    firewall: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <path d="M8 1L14 4v5c0 3-3 5-6 6C5 14 2 12 2 9V4L8 1z" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 8l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    server: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="2" width="12" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="2" y="7" width="12" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="12" cy="4" r="0.8" fill="currentColor"/>
        <circle cx="12" cy="9" r="0.8" fill="currentColor"/>
      </svg>
    ),
    nas: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="3" y="1" width="10" height="14" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        {[4,7,10].map(y => (
          <rect key={y} x="5" y={y} width="6" height="1.5" rx="0.4" fill="currentColor"/>
        ))}
      </svg>
    ),
    access_point: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
        <path d="M5 7.5a4.2 4.2 0 016 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M3 5.5a6.5 6.5 0 0110 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="8" y1="11.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    wall_plate: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="5" y="5" width="2.5" height="3.5" rx="0.4" stroke="currentColor" strokeWidth="1"/>
        <rect x="8.5" y="5" width="2.5" height="3.5" rx="0.4" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
    modem: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="5" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="8" y1="2" x2="8" y2="5" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="5" cy="8.5" r="0.8" fill="currentColor"/>
        <circle cx="8" cy="8.5" r="0.8" fill="currentColor"/>
        <circle cx="11" cy="8.5" r="0.8" fill="#22C55E"/>
      </svg>
    ),
    media_converter: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="7" y1="4" x2="7" y2="12" stroke="currentColor" strokeWidth="0.8"/>
        <circle cx="4.5" cy="8" r="1" fill="#3B82F6"/>
        <circle cx="11.5" cy="8" r="1" fill="#F59E0B"/>
      </svg>
    ),
    ups: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 5l-2 3.5h2L8 11" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="11" y1="5.5" x2="11" y2="10.5" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
    pdu: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="1" y="6" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        {[3,5.5,8,10.5,13].map(x => (
          <rect key={x} x={x-0.6} y="7.2" width="1.2" height="1.6" rx="0.3" fill="currentColor"/>
        ))}
      </svg>
    ),
    shelf: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1"/>
        <circle cx="8" cy="9.5" r="0.6" fill="currentColor"/>
      </svg>
    ),
    blank: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5"/>
      </svg>
    ),
    other: (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        <text x="8" y="11" textAnchor="middle" fontSize="8" fill="currentColor">?</text>
      </svg>
    ),
  }
  return icons[type] || icons.other
}
