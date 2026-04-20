'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface Props {
  portfolioId: string
  onUploaded: (file: any) => void
}

export default function FileUploadZone({ portfolioId, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        const { data } = await api.post(`/api/portfolios/${portfolioId}/files`, form)
        onUploaded(data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Upload failed.')
    } finally { setUploading(false) }
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <div className="text-4xl mb-3">📁</div>
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
