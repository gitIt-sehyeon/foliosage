interface Props {
  fileId: string
  portfolioId: string
  filename: string
  fileHash: string
  certifiedAt: string
}

export default function CertificateBadge({ fileId, portfolioId, filename, fileHash, certifiedAt }: Props) {
  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/portfolios/${portfolioId}/certificates/${fileId}/download`

  return (
    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📜</span>
        <div>
          <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{filename}</p>
          <p className="text-xs text-slate-400 font-mono">{fileHash.slice(0, 12)}...</p>
          <p className="text-xs text-slate-400">{new Date(certifiedAt).toLocaleDateString()}</p>
        </div>
      </div>
      <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
        <button className="text-xs text-purple-600 border border-purple-300 rounded-lg px-3 py-1.5 hover:bg-purple-100 transition-colors">
          Download PDF
        </button>
      </a>
    </div>
  )
}
