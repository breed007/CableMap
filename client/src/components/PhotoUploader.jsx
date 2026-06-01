import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../utils/api'

/**
 * Reusable photo gallery + uploader.
 * Attaches to a polymorphic entity: entity_type in device|connection|location|gallery.
 * For gallery, entity_id may be omitted.
 */
export default function PhotoUploader({ entityType, entityId, title = 'Photos', compact = false }) {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const fileInput = useRef(null)

  const load = useCallback(() => {
    const params = new URLSearchParams({ entity_type: entityType })
    if (entityId) params.set('entity_id', entityId)
    // Only show images here; documents are handled by DocumentUploader.
    api.get(`/attachments?${params}`).then(r => setPhotos(r.data.filter(a => (a.mime_type || '').startsWith('image/'))))
  }, [entityType, entityId])

  useEffect(() => {
    if (entityType === 'gallery' || entityId) load()
  }, [load, entityType, entityId])

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('entity_type', entityType)
        if (entityId) fd.append('entity_id', entityId)
        await api.post('/attachments', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/attachments/${id}`)
    setLightbox(null)
    load()
  }

  const saveCaption = async (id, caption) => {
    await api.put(`/attachments/${id}`, { caption })
    load()
  }

  const [dragOver, setDragOver] = useState(false)

  return (
    <div>
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">{title} <span className="text-gray-600">({photos.length})</span></h3>
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)) }}
        className={`grid ${compact ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'} gap-2`}
      >
        {photos.map(p => (
          <button
            key={p.id}
            onClick={() => setLightbox(p)}
            className="relative aspect-square rounded-lg overflow-hidden bg-[#1e1e1e] border border-[#374151] hover:border-[#06B6D4] transition-colors group"
          >
            <img src={`/api/attachments/${p.id}/thumb`} alt={p.caption || p.original_name}
              className="w-full h-full object-cover" loading="lazy"/>
            {p.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-gray-200 px-1.5 py-1 truncate">{p.caption}</div>
            )}
          </button>
        ))}

        {/* Add tile */}
        <button
          onClick={() => fileInput.current?.click()}
          className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
            dragOver ? 'border-[#06B6D4] bg-[#06B6D4]/10' : 'border-[#374151] hover:border-[#06B6D4] bg-[#1e1e1e]'
          }`}
        >
          {uploading ? (
            <span className="text-[#06B6D4] text-xs animate-pulse">Uploading…</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[10px] text-gray-500 px-1 text-center">Add / drop photo</span>
            </>
          )}
        </button>
      </div>

      <input ref={fileInput} type="file" accept="image/*" multiple className="hidden"
        onChange={e => handleFiles(Array.from(e.target.files))}/>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm"/>
          <div className="relative max-w-3xl w-full bg-[#141414] border border-[#374151] rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={`/api/attachments/${lightbox.id}/file`} alt={lightbox.caption || ''} className="w-full max-h-[70vh] object-contain bg-black"/>
            <div className="p-3 flex items-center gap-2">
              <input
                defaultValue={lightbox.caption || ''}
                placeholder="Add a caption…"
                onBlur={e => saveCaption(lightbox.id, e.target.value)}
                className="flex-1 bg-[#1e1e1e] border border-[#374151] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#06B6D4]"
              />
              <a href={`/api/attachments/${lightbox.id}/file`} target="_blank" rel="noreferrer"
                className="text-xs px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded transition-colors">Open</a>
              <button onClick={() => handleDelete(lightbox.id)}
                className="text-xs px-3 py-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-red-400 rounded transition-colors">Delete</button>
              <button onClick={() => setLightbox(null)} className="text-gray-400 hover:text-white text-xl leading-none px-1">&times;</button>
            </div>
            <div className="px-3 pb-3 text-[11px] text-gray-600 font-mono truncate">{lightbox.original_name}</div>
          </div>
        </div>
      )}
    </div>
  )
}
