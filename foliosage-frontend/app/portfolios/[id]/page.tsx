'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Bot,
  CheckCircle2,
  CirclePause,
  Copy,
  ExternalLink,
  File,
  FileText,
  Folder,
  FolderOpen,
  ImageIcon,
  LinkIcon,
  Trash2,
  Video,
  XCircle,
} from 'lucide-react'
import { isLoggedIn } from '@/lib/auth'
import FileUploadZone from '@/components/FileUploadZone'
import DefenseRoom from '@/components/DefenseRoom'
import CountUpNumber from '@/components/ui/CountUpNumber'
import api from '@/lib/api'

function FileTypeIcon({ mimeType, className = 'size-6' }: { mimeType: string; className?: string }) {
  const Icon = mimeType?.includes('pdf') ? FileText
    : mimeType?.includes('image') ? ImageIcon
    : mimeType?.includes('video') ? Video
    : mimeType?.includes('zip') || mimeType?.includes('archive') ? Archive
    : File
  return <Icon className={className} />
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'done') return <CheckCircle2 className="size-4" />
  if (status === 'failed') return <XCircle className="size-4" />
  if (['generating', 'applying', 'materializing'].includes(status)) return <Bot className="size-4" />
  return <CirclePause className="size-4" />
}

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [portfolio, setPortfolio] = useState<any>(null)
  const [stats, setStats] = useState({ viewCount: 0, downloadCount: 0, todayViews: 0 })
  const [organizeStatus, setOrganizeStatus] = useState({ status: 'idle', message: '분류 전' })
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [organizeTree, setOrganizeTree] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingDesc, setEditingDesc] = useState<{ id: string; value: string } | null>(null)
  const [publishError, setPublishError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadPortfolio = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/portfolios/${id}`)
      setPortfolio(data)
    } catch {
      router.push('/dashboard')
    }
  }, [id, router])

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/portfolios/${id}/stats`)
      setStats(data)
    } catch { /* stats are non-critical */ }
  }, [id])

  const pollOrganizeStatus = useCallback(async () => {
    const { data } = await api.get(`/api/portfolios/${id}/organize/status`)
    setOrganizeStatus(data)
    if (['generating', 'applying', 'materializing'].includes(data.status)) {
      setTimeout(pollOrganizeStatus, 3000)
    } else {
      setIsOrganizing(false)
      if (data.status === 'done') {
        try {
          const { data: tree } = await api.get(`/api/portfolios/${id}/organize/tree`)
          setOrganizeTree(tree)
        } catch { /* tree is non-critical */ }
      }
    }
  }, [id])

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    loadPortfolio()
    loadStats()
    pollOrganizeStatus().catch(() => {})
  }, [loadPortfolio, loadStats, pollOrganizeStatus, router])

  const startOrganize = async () => {
    if (isOrganizing) return
    setIsOrganizing(true)
    try {
      await api.post(`/api/portfolios/${id}/organize`)
      pollOrganizeStatus()
    } catch { setIsOrganizing(false) }
  }

  const publish = async () => {
    try {
      await api.post(`/api/portfolios/${id}/publish`)
      setPublishError('')
      loadPortfolio()
    } catch (e: any) {
      setPublishError(e?.response?.data?.message ?? '공개 실패')
    }
  }

  const copyLink = () => {
    if (!portfolio?.shareCode) return
    navigator.clipboard.writeText(`${window.location.origin}/p/${portfolio.shareCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const deleteFile = async (fileId: string) => {
    try {
      await api.delete(`/api/portfolios/${id}/files/${fileId}`)
      setDeleteConfirm(null)
      loadPortfolio()
      loadStats()
    } catch { /* ignore */ }
  }

  const saveDescription = async (fileId: string, description: string) => {
    setEditingDesc(null)
    try {
      await api.patch(`/api/portfolios/${id}/files/${fileId}`, { description })
      loadPortfolio()
    } catch { /* ignore */ }
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-6 w-32 skeleton-loading rounded mx-auto" />
          <div className="h-4 w-48 skeleton-loading rounded mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] overflow-hidden">

      {/* ── Nav ── */}
      <nav className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-[#070b15] border-b border-white/10">
        <Link href="/dashboard" className="text-[#a78bfa] font-bold text-sm tracking-[0.24em]">FolioSage</Link>
        <div className="flex gap-2">
          {portfolio.shareCode && (
            <Link href={`/p/${portfolio.shareCode}`} target="_blank"
              className="inline-flex items-center gap-2 text-[#94a3b8] text-xs px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white transition-colors">
              <ExternalLink className="size-3.5" />
              공개 페이지
            </Link>
          )}
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 text-[#94a3b8] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-white transition-colors">
            <ArrowLeft className="size-3.5" />
            대시보드
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-[296px] flex-shrink-0 bg-[#070b15] border-r border-white/10 overflow-y-auto p-5 space-y-5 relative">
          {/* Subtle aurora on sidebar */}
          <div
            className="absolute inset-0 animate-aurora opacity-10 pointer-events-none"
            style={{ background: 'linear-gradient(160deg, #1e0a3c, #080e1a, #080e1a, #0d1020)' }}
          />

          {/* Portfolio title + status */}
          <div className="relative rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#64748b]">Portfolio</p>
            <h2 className="text-white font-semibold text-base leading-snug">{portfolio.title}</h2>
            <div className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full mt-3 ${
              portfolio.published ? 'bg-[#064e3b] text-[#34d399]' : 'bg-[#1e293b] text-[#94a3b8]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${portfolio.published ? 'bg-[#34d399]' : 'bg-[#64748b]'}`} />
              {portfolio.published ? '공개 중' : '비공개'}
            </div>
          </div>

          {/* Stats */}
          <div className="relative">
            <p className="mb-2 flex items-center gap-2 text-[#64748b] text-[10px] font-bold uppercase tracking-[0.24em]">
              <BarChart3 className="size-3.5" />
              통계
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '총 조회', value: stats.viewCount, color: 'text-[#a78bfa]' },
                { label: '오늘', value: stats.todayViews, color: 'text-[#34d399]' },
                { label: '다운', value: stats.downloadCount, color: 'text-[#fbbf24]' },
              ].map(({ label, value, color }, i) => (
                <div key={label}
                  className="bg-[#0f172a] border border-white/10 rounded-xl px-2 py-3 text-center animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CountUpNumber target={value} className={`${color} text-lg font-semibold block`} />
                  <p className="text-[#64748b] text-[10px] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI organize */}
          <div className="relative space-y-2">
            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-[0.24em]">AI 분류</p>
            <div className={`rounded-xl px-3 py-3 flex items-center gap-2.5 text-sm border ${
              organizeStatus.status === 'done'    ? 'bg-[#064e3b] text-[#34d399]' :
              organizeStatus.status === 'failed'  ? 'bg-[#450a0a] text-[#f87171]' :
              ['generating','applying','materializing'].includes(organizeStatus.status)
                                                  ? 'bg-[#1e0a3c] text-[#a78bfa]' :
                                                    'bg-[#0f172a] text-[#64748b]'
            } border-white/10`}>
              <StatusIcon status={organizeStatus.status} />
              <span className="flex-1 truncate">{organizeStatus.message}</span>
            </div>

            {organizeTree?.nodes?.length > 0 && (
              <div className="space-y-1 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-[#0b1020] p-2">
                {organizeTree.nodes.map((node: any) => (
                  <div key={node.id}>
                    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs text-[#c4b5fd]">
                      <Folder className="size-4" />
                      <span className="truncate">{node.name}</span>
                      <span className="ml-auto text-[#475569]">{node.fileCount}</span>
                    </div>
                    {node.children?.map((child: any) => (
                      <div key={child.id} className="flex items-center gap-2 py-1 px-2 pl-7 text-[11px] text-[#64748b]">
                        <FileText className="size-3.5" />
                        <span className="truncate">{child.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {portfolio.files?.length > 0 && (organizeStatus.status === 'idle' || organizeStatus.status === 'failed' || organizeStatus.status === 'done') && (
              <button
                onClick={startOrganize}
                disabled={isOrganizing}
                className="w-full text-sm px-3 py-3 bg-[#1e0a3c] hover:bg-[#2d1458] border border-[#6d28d9] text-[#c4b5fd] rounded-xl transition-colors disabled:opacity-40"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Bot className="size-4" />
                  {isOrganizing ? '분석 중...' : 'AI 분류 시작'}
                </span>
              </button>
            )}
          </div>

          {/* Quick links */}
          <div className="relative space-y-1.5">
            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-[0.24em] mb-2">링크</p>
            {publishError && (
              <p className="text-[#f87171] text-[10px]">{publishError}</p>
            )}
            {portfolio.shareCode ? (
              <>
                <button
                  onClick={copyLink}
                  className="w-full text-left text-sm px-3 py-3 bg-[#0f172a] border border-white/10 text-[#94a3b8] rounded-xl hover:border-[#6d28d9] transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? '복사됨' : '링크 복사'}
                  </span>
                </button>
                <Link
                  href={`/p/${portfolio.shareCode}`}
                  target="_blank"
                  className="block text-sm px-3 py-3 bg-[#0f172a] border border-white/10 text-[#94a3b8] rounded-xl hover:border-[#6d28d9] transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink className="size-3.5" />
                    외부에서 보기
                  </span>
                </Link>
              </>
            ) : (
              <button
                onClick={publish}
                className="w-full text-sm px-3 py-3 bg-[#6d28d9] hover:bg-[#7c3aed] text-white rounded-xl transition-colors"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LinkIcon className="size-3.5" />
                  포트폴리오 공개
                </span>
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto bg-[#0b1020] p-6 space-y-5">

          {/* Upload zone (compact) */}
          <FileUploadZone portfolioId={id} onUploaded={() => loadPortfolio()} compact />

          <DefenseRoom
            portfolioId={id}
            published={portfolio.published}
            fileCount={portfolio.files?.length ?? 0}
          />

          {/* File grid */}
          {portfolio.files?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {portfolio.files.map((file: any, i: number) => (
                <div
                  key={file.id}
                  className="group relative min-h-[132px] rounded-xl border border-white/10 bg-[#111827]/90 p-4 transition-all animate-slide-up hover:border-[#6d28d9]/70 hover:bg-[#162033] hover:shadow-[0_12px_40px_rgba(0,0,0,0.22)]"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => setDeleteConfirm(file.id)}
                    className="absolute top-3 right-3 text-[#f87171] opacity-0 group-hover:opacity-100 p-1 hover:bg-[#450a0a] rounded transition-all"
                    aria-label="파일 삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  {/* Icon */}
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.07] text-[#c4b5fd]">
                    <FileTypeIcon mimeType={file.mimeType} className="size-6" />
                  </div>

                  {/* Filename */}
                  <p className="text-white font-medium text-sm leading-5 line-clamp-2 pr-8">{file.name}</p>

                  {/* Description inline edit */}
                  {editingDesc?.id === file.id ? (
                    <input
                      autoFocus
                      value={editingDesc!.value}
                      onChange={e => setEditingDesc({ id: file.id, value: e.target.value })}
                      onBlur={() => saveDescription(file.id, editingDesc!.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveDescription(file.id, editingDesc!.value)
                        if (e.key === 'Escape') setEditingDesc(null)
                      }}
                      maxLength={200}
                      placeholder="설명 입력..."
                      className="w-full mt-2 text-xs bg-[#0f172a] border border-[#6d28d9] text-[#94a3b8] rounded-lg px-2 py-1.5 outline-none"
                    />
                  ) : (
                    <p
                      onClick={() => setEditingDesc({ id: file.id, value: file.description ?? '' })}
                      className="text-[#64748b] text-xs mt-2 cursor-pointer hover:text-[#94a3b8] min-h-[18px] transition-colors line-clamp-2"
                    >
                      {file.description || '+ 설명 추가'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#334155]">
              <FolderOpen className="mx-auto mb-3 size-10" />
              <p className="text-sm">파일을 업로드하면 여기에 표시됩니다.</p>
            </div>
          )}
        </main>
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 max-w-sm w-full mx-4 animate-spring-in">
            <h3 className="text-white font-bold text-base mb-2">파일 삭제</h3>
            <p className="text-[#94a3b8] text-sm mb-5">
              이 파일을 삭제하면 복구할 수 없습니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-[#64748b] text-sm px-4 py-2 rounded-lg hover:bg-[#0f172a] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => deleteFile(deleteConfirm)}
                className="bg-[#f87171] hover:bg-[#ef4444] text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
