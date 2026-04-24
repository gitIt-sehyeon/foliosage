interface Props {
  fileId: string
  shareCode: string
  filename: string
  fileHash: string
  certifiedAt: string | null
}

export default function CertificateBadge({ fileId, shareCode, filename, fileHash, certifiedAt }: Props) {
  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/api/public/${shareCode}/certificates/${fileId}/download`

  return (
    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📜</span>
        <div>
          <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{filename}</p>
          <p className="text-xs text-slate-400 font-mono">{fileHash.slice(0, 12)}...</p>
          <p className="text-xs text-slate-400">{certifiedAt ? new Date(certifiedAt).toLocaleDateString() : 'Pending'}</p>
        </div>
      </div>
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-purple-600 border border-purple-300 rounded-lg px-3 py-1.5 hover:bg-purple-100 transition-colors"
      >
        Download PDF
      </a>
    </div>
  )
}
