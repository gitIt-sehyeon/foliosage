'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ChatPanel from '@/components/ChatPanel'
import CertificateBadge from '@/components/CertificateBadge'
import api from '@/lib/publicApi'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export default function PublicPortfolioPage() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [showCerts, setShowCerts] = useState(false)
  const [previewError, setPreviewError] = useState(false)

  useEffect(() => {
    api.get(`/api/public/${shareCode}`)
      .then(r => { setPortfolio(r.data); setSelectedFile(r.data.files?.[0] ?? null) })
      .catch(() => setError('This portfolio could not be found.'))
  }, [shareCode])

  useEffect(() => {
    setPreviewError(false)
  }, [selectedFile])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-slate-500">{error}</p>
      </div>
    </div>
  )

  if (!portfolio) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-4xl">⟳</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-purple-300 text-sm mb-1">FolioSage Portfolio</p>
            <h1 className="text-2xl font-bold">{portfolio.title}</h1>
            {portfolio.description && <p className="text-purple-200 text-sm mt-1">{portfolio.description}</p>}
          </div>
          <button
            className="text-sm border border-purple-400 rounded-lg px-4 py-2 hover:bg-purple-800 transition-colors"
            onClick={() => setShowCerts(!showCerts)}
          >
            📜 {showCerts ? 'Hide' : 'View'} Certificates
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {showCerts && portfolio.files?.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolio.files.map((f: any) => (
              <CertificateBadge
                key={f.id}
                fileId={f.id}
                shareCode={shareCode}
                filename={f.name}
                fileHash={f.fileHash}
                certifiedAt={f.certifiedAt}
              />
            ))}
          </div>
        )}

        <div className="flex gap-6 h-[calc(100vh-260px)]">
          {/* Gallery Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedFile && (
              <div className="flex-1 bg-white rounded-2xl border overflow-hidden mb-3 flex items-center justify-center">
                {previewError ? (
                  <div className="text-center text-slate-400">
                    <div className="text-6xl mb-3">📄</div>
                    <p className="text-sm">{selectedFile.name}</p>
                    <p className="text-xs mt-1">Preview not available</p>
                  </div>
                ) : selectedFile.mimeType === 'application/pdf' ? (
                  <object
                    data={`${API_URL}/api/public/${shareCode}/preview/${selectedFile.vaultsageFileId}`}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="text-center text-slate-400">
                      <div className="text-6xl mb-3">📄</div>
                      <p className="text-sm">{selectedFile.name}</p>
                      <p className="text-xs mt-1">Preview not available</p>
                    </div>
                  </object>
                ) : (
                  <img
                    src={`${API_URL}/api/public/${shareCode}/preview/${selectedFile.vaultsageFileId}`}
                    alt={selectedFile.name}
                    className="w-full h-full object-contain"
                    onError={() => setPreviewError(true)}
                  />
                )}
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1">
              {portfolio.files?.map((f: any) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFile(f)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                    selectedFile?.id === f.id ? 'border-purple-500 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={`${API_URL}/api/public/${shareCode}/preview/${f.vaultsageFileId}`}
                    alt={f.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                      img.parentElement!.textContent = '📁'
                    }}
                  />
                </button>
              ))}
            </div>

            {selectedFile && (
              <p className="text-xs text-slate-400 mt-2 text-center">{selectedFile.name}</p>
            )}
          </div>

          {/* Chat Panel */}
          <div className="w-80 flex-shrink-0">
            <ChatPanel shareCode={shareCode} />
          </div>
        </div>
      </div>
    </div>
  )
}
