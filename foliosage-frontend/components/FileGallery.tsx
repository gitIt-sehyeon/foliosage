'use client'
import { useState } from 'react'
import { Archive, File, FileAudio, FileText, ImageIcon, Video } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  vaultsageFileId: string
  fileHash: string
  mimeType: string
  certifiedAt: string
}

interface Props {
  files: FileItem[]
  apiUrl: string
}

function FilePreview({ file, apiUrl }: { file: FileItem; apiUrl: string }) {
  const [imgError, setImgError] = useState(false)
  const previewUrl = `${apiUrl}/api/portfolios/preview/${file.vaultsageFileId}`

  const FileIcon = ({ mime }: { mime: string }) => {
    const Icon = mime?.includes('image') ? ImageIcon
      : mime?.includes('pdf') ? FileText
      : mime?.includes('video') ? Video
      : mime?.includes('audio') ? FileAudio
      : mime?.includes('zip') || mime?.includes('archive') ? Archive
      : File
    return <Icon className="size-10 text-slate-400" />
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <FileIcon mime={file.mimeType} />
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-400 mt-1 font-mono truncate" title={file.fileHash}>
          {file.fileHash.slice(0, 16)}...
        </p>
        <p className="text-xs text-slate-400">
          {new Date(file.certifiedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export default function FileGallery({ files, apiUrl }: Props) {
  if (files.length === 0)
    return <p className="text-slate-400 text-center py-8">No files yet.</p>

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map(f => <FilePreview key={f.id} file={f} apiUrl={apiUrl} />)}
    </div>
  )
}
