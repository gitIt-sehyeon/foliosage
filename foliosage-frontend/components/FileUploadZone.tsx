'use client'
import { useState, useRef } from 'react'
import { FolderPlus, UploadCloud } from 'lucide-react'
import api from '@/lib/api'

interface Props {
  portfolioId: string
  onUploaded: (file: any) => void
  compact?: boolean
}

export default function FileUploadZone({ portfolioId, onUploaded, compact = false }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        const { data } = await api.post(`/api/portfolios/${portfolioId}/files`, form)
        onUploaded(data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.response?.data?.error ?? 'Upload failed.')
    } finally { setUploading(false) }
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
            {uploading ? '업로드 중...' : '파일 추가 (클릭 또는 드래그)'}
          </span>
          <span className="text-[#6d28d9] text-xs font-medium">+ 추가</span>
          <input ref={fileRef} type="file" multiple className="hidden"
                 onChange={e => handleFiles(e.target.files)} />
        </div>
        {error && <p className="text-[#f87171] text-xs mt-1">{error}</p>}
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
          ? <p className="text-purple-600 font-medium">Uploading...</p>
          : <p className="text-slate-500">Drop files here or click to upload<br /><span className="text-sm">Any file type supported</span></p>
        }
        <input ref={fileRef} type="file" multiple className="hidden"
               onChange={e => handleFiles(e.target.files)} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
