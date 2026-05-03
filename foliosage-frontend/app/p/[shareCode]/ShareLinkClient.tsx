'use client'
import { useEffect, useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import CountUpNumber from '@/components/ui/CountUpNumber'
import publicApi from '@/lib/publicApi'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

type FileItem = {
  id: string
  vaultsageFileId: string
  name: string
  mimeType: string
  description: string | null
  certifiedAt: string
  fileHash: string
}

type Portfolio = {
  id: string
  title: string
  description: string | null
  ownerName: string | null
  viewCount: number
  files: FileItem[]
  shareCode: string
}

function fileIcon(mimeType: string) {
  if (mimeType?.includes('pdf')) return '📄'
  if (mimeType?.includes('image')) return '🖼️'
  if (mimeType?.includes('video')) return '🎬'
  if (mimeType?.includes('zip') || mimeType?.includes('archive')) return '📦'
  return '📁'
}

export default function ShareLinkClient({ shareCode }: { shareCode: string }) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi
      .get(`/api/public/${shareCode}`)
      .then(r => {
        setPortfolio(r.data)
        setSelectedFile(r.data.files?.[0] ?? null)
        setLoading(false)
      })
      .catch(() => {
        setError('포트폴리오를 찾을 수 없습니다.')
        setLoading(false)
      })
  }, [shareCode])

  const rawUrl = (file: FileItem, download = false) =>
    `${API_URL}/api/public/${shareCode}/files/${file.vaultsageFileId}/raw${download ? '?download=true' : ''}`

  const handleDownload = () => {
    if (!selectedFile) return
    const a = document.createElement('a')
    a.href = rawUrl(selectedFile, true)
    a.download = selectedFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-[#94a3b8]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] overflow-hidden">

      {/* ── Top bar ── */}
      <div className="h-12 flex-shrink-0 bg-[#080e1a] border-b border-[#1e293b] flex items-center px-4 gap-3 relative overflow-hidden">
        {/* Subtle aurora background on top bar */}
        <div
          className="absolute inset-0 bg-[length:400%_400%] animate-aurora opacity-30 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #1e0a3c, #080e1a, #0d2137, #080e1a)' }}
        />

        <span className="relative text-[#a78bfa] font-bold text-sm tracking-widest flex-shrink-0">
          FolioSage
        </span>
        <div className="w-px h-5 bg-[#334155] flex-shrink-0" />

        <div className="relative flex-1 min-w-0 flex items-center gap-2">
          {loading ? (
            <div className="h-4 w-40 skeleton-loading rounded" />
          ) : (
            <>
              <span className="text-white font-semibold text-sm truncate">{portfolio?.title}</span>
              {portfolio?.ownerName && (
                <span className="text-[#475569] text-xs hidden sm:inline">
                  by {portfolio.ownerName}
                </span>
              )}
            </>
          )}
        </div>

        <div className="relative flex items-center gap-1 flex-shrink-0">
          {portfolio && portfolio.viewCount > 0 && (
            <span className="text-[#475569] text-xs flex items-center gap-1 mr-2">
              👁 <CountUpNumber target={portfolio.viewCount} />
            </span>
          )}
          <button
            onClick={handleDownload}
            disabled={!selectedFile || loading}
            className="text-[#94a3b8] text-xs hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-40"
          >
            ↓ 다운로드
          </button>
          <button
            onClick={() => setChatOpen(v => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              chatOpen
                ? 'bg-[#6d28d9] text-white'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]'
            }`}
          >
            💬 AI 채팅
          </button>
        </div>
      </div>

      {/* ── Main viewer + chat panel ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* File viewer — shifts left when chat opens */}
        <div
          className="absolute inset-0 transition-[right]"
          style={{
            right: chatOpen ? '320px' : '0',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {loading ? (
            <div className="w-full h-full skeleton-loading" />
          ) : !selectedFile ? (
            <div className="w-full h-full flex items-center justify-center text-[#475569]">
              <div className="text-center">
                <div className="text-5xl mb-3">📂</div>
                <p className="text-sm">파일을 선택하세요</p>
              </div>
            </div>
          ) : selectedFile.mimeType === 'application/pdf' ? (
            <iframe
              src={rawUrl(selectedFile)}
              className="w-full h-full border-0"
              title={selectedFile.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#080e1a]">
              <img
                src={`${API_URL}/api/public/${shareCode}/preview/${selectedFile.vaultsageFileId}`}
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Chat panel — spring slide from right */}
        <div
          className="absolute top-0 bottom-0 right-0 w-80 bg-[#0d1424] border-l border-[#1e293b]"
          style={{
            transform: chatOpen ? 'translateX(0)' : 'translateX(100%)',
            transitionProperty: 'transform',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ChatPanel shareCode={shareCode} dark />
        </div>
      </div>

      {/* ── Bottom file strip ── */}
      <div className="flex-shrink-0 h-[72px] bg-[#080e1a] border-t border-[#1e293b] flex items-center gap-2 px-4 overflow-x-auto">
        {loading ? (
          [0, 1, 2].map(i => (
            <div
              key={i}
              className="flex-shrink-0 w-28 h-10 skeleton-loading rounded-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))
        ) : (
          portfolio?.files?.map((file, i) => {
            const active = selectedFile?.id === file.id
            return (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all animate-slide-up ${
                  active
                    ? 'bg-[#1e0a3c] border-[#6d28d9] text-[#a78bfa] animate-glow-pulse'
                    : 'bg-[#0f172a] border-[#334155] text-[#94a3b8] hover:border-[#475569]'
                }`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="text-base">{fileIcon(file.mimeType)}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate max-w-[110px]">{file.name}</p>
                  {file.description && (
                    <p className="text-[10px] text-[#475569] truncate max-w-[110px]">{file.description}</p>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
