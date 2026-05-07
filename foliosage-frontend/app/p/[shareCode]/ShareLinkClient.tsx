'use client'
import { useEffect, useState } from 'react'
import {
  Archive,
  CheckCircle2,
  Download,
  Eye,
  File,
  FileText,
  FolderOpen,
  ImageIcon,
  MessageSquareText,
  SearchX,
  ShieldCheck,
  Sparkles,
  Video,
  Gavel,
} from 'lucide-react'
import ChatPanel from '@/components/ChatPanel'
import PublicDefensePanel from '@/components/PublicDefensePanel'
import CountUpNumber from '@/components/ui/CountUpNumber'
import publicApi from '@/lib/publicApi'

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

function FileTypeIcon({ mimeType, className = 'size-4' }: { mimeType: string; className?: string }) {
  const Icon = mimeType?.includes('pdf') ? FileText
    : mimeType?.includes('image') ? ImageIcon
    : mimeType?.includes('video') ? Video
    : mimeType?.includes('zip') || mimeType?.includes('archive') ? Archive
    : File
  return <Icon className={className} />
}

function isPdfFile(file: FileItem) {
  return file.mimeType?.toLowerCase().includes('pdf') || file.name.toLowerCase().endsWith('.pdf')
}

export default function ShareLinkClient({ shareCode }: { shareCode: string }) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [defenseOpen, setDefenseOpen] = useState(false)
  const [compactChat, setCompactChat] = useState(false)
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

  useEffect(() => {
    const sync = () => setCompactChat(window.innerWidth < 980)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  const rawUrl = (file: FileItem, download = false) =>
    `/api/public/${encodeURIComponent(shareCode)}/files/${encodeURIComponent(file.vaultsageFileId)}/raw${download ? '?download=true' : ''}`

  const pdfViewerUrl = (file: FileItem) => `${rawUrl(file)}#toolbar=1&navpanes=0&view=FitH`

  const previewUrl = (file: FileItem) =>
    `/api/public/${encodeURIComponent(shareCode)}/preview/${encodeURIComponent(file.vaultsageFileId)}`

  const handleDownload = () => {
    if (!selectedFile) return
    const a = document.createElement('a')
    a.href = rawUrl(selectedFile, true)
    a.download = selectedFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const selectEvidenceFile = (vaultsageFileId: string) => {
    const file = portfolio?.files?.find(item => item.vaultsageFileId === vaultsageFileId)
    if (file) setSelectedFile(file)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <SearchX className="mx-auto mb-4 size-12 text-[#475569]" />
          <p className="text-[#94a3b8]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen flex flex-col bg-[#060912] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(124,58,237,0.20),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(20,184,166,0.12),transparent_26%)]" />

      {/* ── Top bar ── */}
      <div className="relative z-20 h-16 flex-shrink-0 bg-[#070b15]/92 border-b border-white/10 flex items-center px-5 gap-4 overflow-hidden backdrop-blur-xl">
        {/* Subtle aurora background on top bar */}
        <div
          className="absolute inset-0 bg-[length:400%_400%] animate-aurora opacity-20 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #1e0a3c, #080e1a, #0d2137, #080e1a)' }}
        />

        <span className="relative flex items-center gap-2 text-[#a78bfa] font-bold text-sm tracking-[0.24em] flex-shrink-0">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200">
            <Sparkles className="size-4" />
          </span>
          FOLIOSAGE
        </span>
        <div className="w-px h-7 bg-white/10 flex-shrink-0" />

        <div className="relative flex-1 min-w-0 flex items-center gap-2">
          {loading ? (
            <div className="h-4 w-40 skeleton-loading rounded" />
          ) : (
            <div className="min-w-0">
              <span className="block text-white font-semibold text-sm truncate">{portfolio?.title}</span>
              {portfolio?.ownerName && (
                <span className="block text-[#64748b] text-xs truncate">
                  by {portfolio.ownerName}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-2 flex-shrink-0">
          {portfolio && portfolio.viewCount > 0 && (
            <span className="hidden text-[#64748b] text-xs items-center gap-1.5 mr-1 sm:flex">
              <Eye className="size-3.5" />
              <CountUpNumber target={portfolio.viewCount} />
            </span>
          )}
          <button
            onClick={handleDownload}
            disabled={!selectedFile || loading}
            className="text-[#94a3b8] text-xs hover:text-white px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors disabled:opacity-40"
          >
            <span className="inline-flex items-center gap-1.5">
              <Download className="size-3.5" />
              다운로드
            </span>
          </button>
          <button
            onClick={() => {
              setDefenseOpen(v => !v)
              if (!defenseOpen) setChatOpen(false)
            }}
            className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
              defenseOpen
                ? 'border-emerald-300/25 bg-emerald-600 text-white'
                : 'border-white/10 bg-white/[0.03] text-[#94a3b8] hover:text-white hover:bg-white/[0.07]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Gavel className="size-3.5" />
              Defense
            </span>
          </button>
          <button
            onClick={() => {
              setChatOpen(v => !v)
              if (!chatOpen) setDefenseOpen(false)
            }}
            className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
              chatOpen
                ? 'border-violet-300/25 bg-[#6d28d9] text-white'
                : 'border-white/10 bg-white/[0.03] text-[#94a3b8] hover:text-white hover:bg-white/[0.07]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <MessageSquareText className="size-3.5" />
              AI 채팅
            </span>
          </button>
        </div>
      </div>

      {/* ── Main viewer + chat panel ── */}
      <div
        className="relative z-10 grid min-h-0 flex-1 overflow-hidden transition-[grid-template-columns]"
        style={{
          gridTemplateColumns: chatOpen && !compactChat ? 'minmax(0, 1fr) minmax(320px, 380px)' : 'minmax(0, 1fr) 0px',
          transitionDuration: '0.5s',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* File viewer */}
        <div
          className="min-w-0 min-h-0 p-4 md:p-6"
        >
          {loading ? (
            <div className="w-full h-full skeleton-loading rounded-2xl" />
          ) : !selectedFile ? (
            <div className="w-full h-full flex items-center justify-center rounded-2xl border border-white/10 bg-[#0b1020]/80 text-[#475569]">
              <div className="text-center">
                <FolderOpen className="mx-auto mb-3 size-12" />
                <p className="text-sm">파일을 선택하세요</p>
              </div>
            </div>
          ) : isPdfFile(selectedFile) ? (
            <div className="relative h-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/90 shadow-2xl shadow-black/40">
              <div className="absolute left-4 top-4 z-10 max-w-[min(520px,calc(100%-32px))] rounded-xl border border-white/10 bg-[#070b15]/85 p-3 backdrop-blur-xl">
                <p className="truncate text-sm font-semibold text-white">{selectedFile.name}</p>
                {selectedFile.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{selectedFile.description}</p>}
              </div>
              <iframe
                src={pdfViewerUrl(selectedFile)}
                className="block h-full w-full min-w-0 border-0"
                title={selectedFile.name}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#070b15]/92 shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.16),transparent_34%)]" />
              <div className="absolute left-4 top-4 z-10 max-w-[min(520px,calc(100%-32px))] rounded-xl border border-white/10 bg-[#070b15]/85 p-3 backdrop-blur-xl">
                <p className="truncate text-sm font-semibold text-white">{selectedFile.name}</p>
                {selectedFile.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{selectedFile.description}</p>}
              </div>
              <img
                src={previewUrl(selectedFile)}
                alt={selectedFile.name}
                className="relative z-0 max-w-full max-h-full object-contain p-4"
              />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#070b15]/82 p-3 backdrop-blur-xl">
                <span className="inline-flex items-center gap-2 text-xs text-emerald-200">
                  <ShieldCheck className="size-4" />
                  Certified source
                </span>
                <span className="truncate font-mono text-[11px] text-slate-500">
                  {selectedFile.fileHash.slice(0, 24)}...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chat panel — spring slide from right */}
        <div
          className={`${compactChat ? 'absolute bottom-4 right-4 top-4 z-30 w-[min(380px,calc(100%-32px))] rounded-2xl border border-white/10' : 'min-h-0 border-l border-white/10'} overflow-hidden bg-[#070b15]/95 shadow-2xl shadow-black/35 backdrop-blur-xl`}
          style={{
            transform: chatOpen ? 'translateX(0)' : 'translateX(110%)',
            opacity: chatOpen ? 1 : 0,
            pointerEvents: chatOpen ? 'auto' : 'none',
            transitionProperty: 'opacity, transform',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ChatPanel shareCode={shareCode} dark />
        </div>

        <PublicDefensePanel
          shareCode={shareCode}
          open={defenseOpen}
          onClose={() => setDefenseOpen(false)}
          onSelectEvidence={selectEvidenceFile}
        />
      </div>

      {/* ── Bottom file strip ── */}
      <div className="relative z-20 flex-shrink-0 h-[104px] bg-[#070b15]/94 border-t border-white/10 flex items-center gap-3 px-4 overflow-x-auto backdrop-blur-xl">
        {loading ? (
          [0, 1, 2].map(i => (
            <div
              key={i}
              className="flex-shrink-0 w-44 h-14 skeleton-loading rounded-xl"
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
                className={`flex-shrink-0 flex w-56 items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all animate-slide-up ${
                  active
                    ? 'bg-[#1e0a3c] border-[#6d28d9] text-[#c4b5fd] animate-glow-pulse'
                    : 'bg-white/[0.035] border-white/10 text-[#94a3b8] hover:border-[#475569] hover:bg-white/[0.055]'
                }`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className={`flex size-10 items-center justify-center rounded-lg ${active ? 'bg-violet-400/15' : 'bg-white/[0.04]'}`}>
                  <FileTypeIcon mimeType={file.mimeType} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate max-w-[160px]">{file.name}</p>
                  {file.description && (
                    <p className="text-[10px] text-[#64748b] truncate max-w-[160px]">{file.description}</p>
                  )}
                  {file.certifiedAt && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-300">
                      <CheckCircle2 className="size-3" />
                      certified
                    </p>
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
