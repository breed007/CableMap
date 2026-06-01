import { useState, useRef } from 'react'
import api from '../utils/api'

export default function Import() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length === 0) { setError('Empty file'); return }
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      const rows = lines.slice(1, 6).map(l => l.split(',').map(v => v.replace(/"/g, '').trim()))
      setPreview({ headers, rows, total: lines.length - 1 })
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/import/connections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setFile(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed')
    } finally { setImporting(false) }
  }

  const downloadTemplate = () => {
    window.location.href = '/api/export/template'
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Import Connections</h1>
        <p className="text-sm text-gray-500">Bulk-import connections from a CSV file.</p>
      </div>

      {/* Template download */}
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4 mb-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white mb-1">CSV Template</div>
          <div className="text-xs text-gray-500 font-mono">device_a, port_a_label, device_b, port_b_label, cable_type, cable_color, cable_length_ft, vlan_id, status, notes</div>
        </div>
        <button onClick={downloadTemplate}
          className="text-sm px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors shrink-0 ml-4">
          Download Template
        </button>
      </div>

      {/* File upload */}
      <div
        className="border-2 border-dashed border-[#374151] rounded-lg p-8 text-center mb-5 hover:border-[#06B6D4]/50 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const input = fileRef.current; const dt = new DataTransfer(); dt.items.add(f); input.files = dt.files; handleFile({ target: input }) } }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3 text-gray-600">
          <path d="M16 4v16M10 12l6-8 6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 24v3a1 1 0 001 1h22a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {file ? (
          <div className="text-sm text-white">{file.name} <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span></div>
        ) : (
          <div>
            <div className="text-sm text-gray-400">Drop a CSV file here, or click to browse</div>
            <div className="text-xs text-gray-600 mt-1">.csv files only</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile}/>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg mb-5 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between">
            <span className="text-sm font-medium text-white">Preview</span>
            <span className="text-xs text-gray-500">{preview.total} row{preview.total !== 1 ? 's' : ''} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {preview.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {preview.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-gray-400 whitespace-nowrap">{cell || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.total > 5 && (
            <div className="px-4 py-2 text-xs text-gray-600 border-t border-[#1f2937]">
              Showing 5 of {preview.total} rows
            </div>
          )}
        </div>
      )}

      {error && <div className="text-sm text-red-400 mb-4 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</div>}

      {/* Import button */}
      {file && preview && !result && (
        <button onClick={handleImport} disabled={importing}
          className="bg-[#06B6D4] hover:bg-[#0891b2] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {importing ? 'Importing...' : `Import ${preview.total} Connection${preview.total !== 1 ? 's' : ''}`}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4">
          <div className="text-sm font-semibold text-white mb-3">Import Complete</div>
          <div className="flex gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{result.created}</div>
              <div className="text-xs text-gray-500">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{result.errors.length}</div>
              <div className="text-xs text-gray-500">Errors</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Errors</div>
              {result.errors.map((e, i) => (
                <div key={i} className="text-xs bg-[#1e1e1e] rounded px-3 py-1.5 text-red-400">
                  Row {e.row}: {e.error}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setResult(null)} className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Import another file
          </button>
        </div>
      )}
    </div>
  )
}
