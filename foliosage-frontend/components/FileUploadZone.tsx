'use client'
import { useState, useRef } from 'react'
import { FolderPlus, UploadCloud } from 'lucide-react'
import api from '@/lib/api'

interface Props {
  portfolioId: string
  onUploaded: (file: any) => void
  compact?: boolean
  assignedCategory?: string
}

export default function FileUploadZone({ portfolioId, onUploaded, compact = false, assignedCategory }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setProgress({ current: 0, total: files.length })
    setError('')
    try {
      for (const [index, file] of Array.from(files).entries()) {
        setProgress({ current: index + 1, total: files.length })
        const form = new FormData()
        form.append('file', file)
        const { data } = await api.post(`/api/portfolios/${portfolioId}/files`, form)
        if (assignedCategory && data.fileId) {
          await api.patch(`/api/portfolios/${portfolioId}/files/${data.fileId}/category`, {
            category: assignedCategory,
          })
        }
        onUploaded(data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.response?.data?.error ?? 'Upload failed.')
    } finally {
      setUploading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  if (compact) {
    return (
      <div>
        <div
          className="border border-dashed border-[#334155] rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[#6d28d9] hover:bg-[#1e0a3c]/20 transition-all"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        >
          <FolderPlus className="size-5 text-[#a78bfa]" />
          <span className="text-[#64748b] text-sm flex-1">
            {uploading ? `Uploading ${progress.current}/${progress.total}` : 'Add files (click or drag)'}
          </span>
          <span className="text-[#6d28d9] text-xs font-medium">+ Add</span>
          <input ref={fileRef} type="file" multiple className="hidden"
                 onChange={e => handleFiles(e.target.files)} />
        </div>
        {error && <p className="text-[#f87171] text-xs mt-1">{error}</p>}
        {!uploading && !error && (
          <p className="mt-1 text-[11px] text-[#475569]">Add file descriptions after upload to improve public evidence context.</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <UploadCloud className="mx-auto mb-3 size-10 text-purple-500" />
        {uploading
          ? <p className="text-purple-600 font-medium">Uploading {progress.current}/{progress.total}...</p>
          : <p className="text-slate-500">Drop files here or click to upload<br /><span className="text-sm">Add source files, drafts, PDFs, images, and proof artifacts</span></p>
        }
        <input ref={fileRef} type="file" multiple className="hidden"
               onChange={e => handleFiles(e.target.files)} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
