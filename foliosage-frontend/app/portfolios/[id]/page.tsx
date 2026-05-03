'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import FileUploadZone from '@/components/FileUploadZone'
import OrganizeStatus from '@/components/OrganizeStatus'
import CountUpNumber from '@/components/ui/CountUpNumber'
import api from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

function fileIcon(mimeType: string) {
  if (mimeType?.includes('pdf')) return '📄'
  if (mimeType?.includes('image')) return '🖼️'
  if (mimeType?.includes('video')) return '🎬'
  if (mimeType?.includes('zip') || mimeType?.includes('archive')) return '📦'
  return '📁'
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
      <nav className="h-12 flex-shrink-0 flex items-center justify-between px-6 bg-[#080e1a] border-b border-[#1e293b]">
        <Link href="/dashboard" className="text-[#a78bfa] font-bold text-sm tracking-widest">FolioSage</Link>
        <div className="flex gap-2">
          {portfolio.shareCode && (
            <Link href={`/p/${portfolio.shareCode}`} target="_blank"
              className="text-[#94a3b8] text-xs px-3 py-1.5 rounded-lg hover:bg-[#1e293b] hover:text-white transition-colors">
              공개 페이지 →
            </Link>
          )}
          <Link href="/dashboard"
            className="text-[#64748b] text-xs px-3 py-1.5 rounded-lg hover:bg-[#1e293b] transition-colors">
            ← 대시보드
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-[220px] flex-shrink-0 bg-[#080e1a] border-r border-[#1e293b] overflow-y-auto p-4 space-y-5 relative">
          {/* Subtle aurora on sidebar */}
          <div
            className="absolute inset-0 animate-aurora opacity-10 pointer-events-none"
            style={{ background: 'linear-gradient(160deg, #1e0a3c, #080e1a, #080e1a, #0d1020)' }}
          />

          {/* Portfolio title + status */}
          <div className="relative">
            <h2 className="text-white font-bold text-sm leading-snug">{portfolio.title}</h2>
            <div className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mt-1.5 ${
              portfolio.published ? 'bg-[#064e3b] text-[#34d399]' : 'bg-[#1e293b] text-[#64748b]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${portfolio.published ? 'bg-[#34d399]' : 'bg-[#64748b]'}`} />
              {portfolio.published ? '공개 중' : '비공개'}
            </div>
          </div>

          {/* Stats */}
          <div className="relative">
            <p className="text-[#475569] text-[9px] font-bold uppercase tracking-widest mb-2">통계</p>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: '총 조회', value: stats.viewCount, color: 'text-[#a78bfa]' },
                { label: '오늘', value: stats.todayViews, color: 'text-[#34d399]' },
                { label: '다운', value: stats.downloadCount, color: 'text-[#fbbf24]' },
              ].map(({ label, value, color }, i) => (
                <div key={label}
                  className="bg-[#0f172a] border border-[#1e293b] rounded-lg py-2 text-center animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CountUpNumber target={value} className={`${color} text-sm font-bold block`} />
                  <p className="text-[#475569] text-[8px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI organize */}
          <div className="relative space-y-2">
            <p className="text-[#475569] text-[9px] font-bold uppercase tracking-widest">AI 분류</p>
            <div className={`rounded-lg px-3 py-2 flex items-center gap-2 text-xs ${
              organizeStatus.status === 'done'    ? 'bg-[#064e3b] text-[#34d399]' :
              organizeStatus.status === 'failed'  ? 'bg-[#450a0a] text-[#f87171]' :
              ['generating','applying','materializing'].includes(organizeStatus.status)
                                                  ? 'bg-[#1e0a3c] text-[#a78bfa]' :
                                                    'bg-[#0f172a] text-[#64748b]'
            }`}>
              <span>{
                organizeStatus.status === 'done'    ? '✅' :
                organizeStatus.status === 'failed'  ? '❌' :
                ['generating','applying','materializing'].includes(organizeStatus.status) ? '🤖' : '⏸️'
              }</span>
              <span className="flex-1 truncate">{organizeStatus.message}</span>
            </div>

            {organizeTree?.nodes?.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {organizeTree.nodes.map((node: any) => (
                  <div key={node.id}>
                    <div className="flex items-center gap-1.5 py-1 px-2 rounded text-[11px] text-[#a78bfa]">
                      <span>📁</span>
                      <span className="truncate">{node.name}</span>
                      <span className="ml-auto text-[#475569]">{node.fileCount}</span>
                    </div>
                    {node.children?.map((child: any) => (
                      <div key={child.id} className="flex items-center gap-1.5 py-0.5 px-2 pl-5 text-[10px] text-[#64748b]">
                        <span>📄</span>
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
                className="w-full text-xs px-3 py-2 bg-[#1e0a3c] hover:bg-[#2d1458] border border-[#6d28d9] text-[#a78bfa] rounded-lg transition-colors disabled:opacity-40"
              >
                {isOrganizing ? '⏳ 분석 중...' : '🤖 AI 분류 시작'}
              </button>
            )}
          </div>

          {/* Quick links */}
          <div className="relative space-y-1.5">
            <p className="text-[#475569] text-[9px] font-bold uppercase tracking-widest mb-2">링크</p>
            {publishError && (
              <p className="text-[#f87171] text-[10px]">{publishError}</p>
            )}
            {portfolio.shareCode ? (
              <>
                <button
                  onClick={copyLink}
                  className="w-full text-left text-xs px-3 py-2 bg-[#0f172a] border border-[#334155] text-[#94a3b8] rounded-lg hover:border-[#6d28d9] transition-colors"
                >
                  {copied ? '✅ 복사됨' : '🔗 링크 복사'}
                </button>
                <Link
                  href={`/p/${portfolio.shareCode}`}
                  target="_blank"
                  className="block text-xs px-3 py-2 bg-[#0f172a] border border-[#334155] text-[#94a3b8] rounded-lg hover:border-[#6d28d9] transition-colors"
                >
                  외부에서 보기 ↗
                </Link>
              </>
            ) : (
              <button
                onClick={publish}
                className="w-full text-xs px-3 py-2 bg-[#6d28d9] hover:bg-[#7c3aed] text-white rounded-lg transition-colors"
              >
                🔗 포트폴리오 공개
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Upload zone (compact) */}
          <FileUploadZone portfolioId={id} onUploaded={() => loadPortfolio()} compact />

          {/* File grid */}
          {portfolio.files?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {portfolio.files.map((file: any, i: number) => (
                <div
                  key={file.id}
                  className="group bg-[#1e293b] border border-[#334155] rounded-xl p-4 relative hover:border-[#475569] transition-all animate-slide-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => setDeleteConfirm(file.id)}
                    className="absolute top-3 right-3 text-[#f87171] opacity-0 group-hover:opacity-100 p-1 hover:bg-[#450a0a] rounded transition-all"
                    aria-label="파일 삭제"
                  >
                    🗑️
                  </button>

                  {/* Icon */}
                  <div className="text-3xl mb-2">{fileIcon(file.mimeType)}</div>

                  {/* Filename */}
                  <p className="text-white font-medium text-sm truncate pr-8">{file.name}</p>

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
                      className="w-full mt-1.5 text-xs bg-[#0f172a] border border-[#6d28d9] text-[#94a3b8] rounded px-2 py-1 outline-none"
                    />
                  ) : (
                    <p
                      onClick={() => setEditingDesc({ id: file.id, value: file.description ?? '' })}
                      className="text-[#475569] text-xs mt-1.5 cursor-pointer hover:text-[#94a3b8] min-h-[16px] transition-colors"
                    >
                      {file.description || '+ 설명 추가'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#334155]">
              <p className="text-4xl mb-3">📂</p>
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
