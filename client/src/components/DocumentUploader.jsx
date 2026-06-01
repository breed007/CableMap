import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../utils/api'

const ACCEPT = '.pdf,.vsd,.vss,.vsdx,.vssx,.vstx,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip'

function fileKind(name = '', mime = '') {
  const ext = name.split('.').pop()?.toLowerCase()
  if (mime.includes('pdf') || ext === 'pdf') return { label: 'PDF', color: '#EF4444' }
  if (['vsd', 'vss', 'vsdx', 'vssx', 'vstx'].includes(ext)) return { label: 'VISIO', color: '#3B82F6' }
  if (['doc', 'docx'].includes(ext)) return { label: 'DOC', color: '#2563EB' }
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { label: 'XLS', color: '#22C55E' }
  if (ext === 'zip') return { label: 'ZIP', color: '#F59E0B' }
  return { label: (ext || 'FILE').toUpperCase().slice(0, 5), color: '#6B7280' }
}

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Lists + uploads non-image documents (spec sheets, Visio stencils, etc.)
 * attached to a polymorphic entity (device | template | ...).
 */
export default function DocumentUploader({ entityType, entityId, title = 'Documents' }) {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInput = useRef(null)

  const load = useCallback(() => {
    const params = new URLSearchParams({ entity_type: entityType })
    if (entityId) params.set('entity_id', entityId)
    api.get(`/attachments?${params}`).then(r => setDocs(r.data.filter(a => !(a.mime_type || '').startsWith('image/'))))
  }, [entityType, entityId])

  useEffect(() => { if (entityId || entityType === 'gallery') load() }, [load, entityId, entityType])

  const handleFiles = async (files) => {
    if (!files?.length) return
    setError(''); setUploading(true)
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

  const remove = async (id) => { await api.delete(`/attachments/${id}`); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide">{title} <span className="text-gray-600">({docs.length})</span></h3>
        <button onClick={() => fileInput.current?.click()} className="text-xs text-[#06B6D4] hover:underline">+ Add file</button>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)) }}
        className={`rounded-lg border ${dragOver ? 'border-[#06B6D4] bg-[#06B6D4]/5' : 'border-[#374151]'} divide-y divide-[#1f2937]`}
      >
        {docs.length === 0 ? (
          <button onClick={() => fileInput.current?.click()} className="w-full px-3 py-4 text-center text-xs text-gray-600 hover:text-[#06B6D4]">
            {uploading ? 'Uploading…' : 'Drop a PDF spec sheet or Visio stencil here, or click to browse'}
          </button>
        ) : docs.map(d => {
          const k = fileKind(d.original_name, d.mime_type)
          return (
            <div key={d.id} className="flex items-center gap-3 px-3 py-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: k.color + '22', color: k.color }}>{k.label}</span>
              <a href={`/api/attachments/${d.id}/file`} target="_blank" rel="noreferrer"
                className="text-sm text-gray-200 hover:text-[#06B6D4] truncate flex-1">{d.original_name || d.filename}</a>
              <span className="text-xs text-gray-600 shrink-0">{fmtSize(d.size_bytes)}</span>
              <button onClick={() => remove(d.id)} className="text-gray-600 hover:text-red-400 text-sm shrink-0">&times;</button>
            </div>
          )
        })}
        {docs.length > 0 && uploading && <div className="px-3 py-2 text-xs text-[#06B6D4] animate-pulse">Uploading…</div>}
      </div>

      <input ref={fileInput} type="file" accept={ACCEPT} multiple className="hidden" onChange={e => handleFiles(Array.from(e.target.files))}/>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
