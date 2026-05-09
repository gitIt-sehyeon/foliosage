'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CirclePause,
  Compass,
  Copy,
  ExternalLink,
  FileCheck2,
  FileStack,
  FileText,
  File,
  Folder,
  FolderOpen,
  Globe2,
  ImageIcon,
  Archive,
  Layers,
  LinkIcon,
  ListChecks,
  Loader2,
  PlayCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  Wand2,
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
  const [publishBusy, setPublishBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [readiness, setReadiness] = useState<any>(null)
  const [storyForm, setStoryForm] = useState({
    summary: '',
    role: '',
    problem: '',
    solution: '',
    impact: '',
    evidenceHighlights: [] as any[],
    missingProof: [] as string[],
    interviewQuestions: [] as string[],
  })
  const [storyGenerating, setStoryGenerating] = useState(false)
  const [storySaving, setStorySaving] = useState(false)
  const [storyError, setStoryError] = useState('')
  const [tab, setTab] = useState<'story' | 'files' | 'activity'>('story')

  const loadPortfolio = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/portfolios/${id}`)
      setPortfolio(data)
      setStoryForm({
        summary: data.story?.summary ?? '',
        role: data.story?.role ?? '',
        problem: data.story?.problem ?? '',
        solution: data.story?.solution ?? '',
        impact: data.story?.impact ?? '',
        evidenceHighlights: data.story?.evidenceHighlights ?? [],
        missingProof: data.story?.missingProof ?? [],
        interviewQuestions: data.story?.interviewQuestions ?? [],
      })
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

  const loadReadiness = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/portfolios/${id}/readiness`)
      setReadiness(data)
    } catch { /* readiness is non-critical */ }
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
    loadReadiness()
    pollOrganizeStatus().catch(() => {})
  }, [loadPortfolio, loadStats, loadReadiness, pollOrganizeStatus, router])

  const startOrganize = async () => {
    if (isOrganizing) return
    setIsOrganizing(true)
    try {
      await api.post(`/api/portfolios/${id}/organize`)
      pollOrganizeStatus()
    } catch { setIsOrganizing(false) }
  }

  const publish = async () => {
    if (publishBusy) return
    setPublishBusy(true)
    try {
      await api.post(`/api/portfolios/${id}/publish`)
      setPublishError('')
      loadPortfolio()
      loadReadiness()
    } catch (e: any) {
      setPublishError(e?.response?.data?.message ?? '공개 실패')
    } finally {
      setPublishBusy(false)
    }
  }

  const unpublish = async () => {
    if (publishBusy) return
    setPublishBusy(true)
    try {
      await api.post(`/api/portfolios/${id}/unpublish`)
      setPublishError('')
      loadPortfolio()
      loadReadiness()
    } catch (e: any) {
      setPublishError(e?.response?.data?.message ?? '비공개 전환 실패')
    } finally {
      setPublishBusy(false)
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
      loadReadiness()
    } catch { /* ignore */ }
  }

  const saveDescription = async (fileId: string, description: string) => {
    setEditingDesc(null)
    try {
      await api.patch(`/api/portfolios/${id}/files/${fileId}`, { description })
      loadPortfolio()
      loadReadiness()
    } catch { /* ignore */ }
  }

  const generateStory = async () => {
    if (storyGenerating || files.length === 0) return
    setStoryGenerating(true)
    setStoryError('')
    try {
      const { data } = await api.post(`/api/portfolios/${id}/story/generate`)
      setPortfolio((prev: any) => ({ ...prev, story: data }))
      setStoryForm({
        summary: data.summary ?? '',
        role: data.role ?? '',
        problem: data.problem ?? '',
        solution: data.solution ?? '',
        impact: data.impact ?? '',
        evidenceHighlights: data.evidenceHighlights ?? [],
        missingProof: data.missingProof ?? [],
        interviewQuestions: data.interviewQuestions ?? [],
      })
      loadReadiness()
    } catch (e: any) {
      setStoryError(e?.response?.data?.message ?? '스토리 생성에 실패했습니다.')
    } finally {
      setStoryGenerating(false)
    }
  }

  const saveStory = async () => {
    setStorySaving(true)
    setStoryError('')
    try {
      const { data } = await api.patch(`/api/portfolios/${id}/story`, storyForm)
      setPortfolio((prev: any) => ({ ...prev, story: data }))
      setStoryForm({
        summary: data.summary ?? '',
        role: data.role ?? '',
        problem: data.problem ?? '',
        solution: data.solution ?? '',
        impact: data.impact ?? '',
        evidenceHighlights: data.evidenceHighlights ?? [],
        missingProof: data.missingProof ?? [],
        interviewQuestions: data.interviewQuestions ?? [],
      })
      loadReadiness()
    } catch (e: any) {
      setStoryError(e?.response?.data?.message ?? '스토리 저장에 실패했습니다.')
    } finally {
      setStorySaving(false)
    }
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

  const files = portfolio.files ?? []
  const describedFiles = files.filter((file: any) => file.description && file.description.trim()).length
  const storyReady = readiness?.storyReady ?? Boolean(portfolio.story?.summary)
  const readinessItems = [
    { label: 'Story', done: storyReady, detail: storyReady ? '면접용 스토리 준비됨' : 'Generate Portfolio Story 실행' },
    { label: 'Evidence', done: readiness?.evidenceReady ?? files.length > 0, detail: files.length > 0 ? `${files.length}개 파일, ${describedFiles}개 설명` : '작업 증거 파일을 추가하세요' },
    { label: 'AI Review', done: readiness?.aiReviewReady ?? false, detail: readiness?.aiReviewReady ? '리뷰 완료' : '스토리와 공개 링크 후 실행' },
    { label: 'Public Link', done: readiness?.publicLinkReady ?? portfolio.published, detail: portfolio.published ? '방문자에게 공유 가능' : '공개 링크 생성 필요' },
  ]
  const storyField = (key: 'summary' | 'role' | 'problem' | 'solution' | 'impact', label: string, placeholder: string) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      <textarea
        value={storyForm[key]}
        onChange={e => setStoryForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        rows={key === 'summary' ? 4 : 3}
        className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-[#475569] focus:border-[#6d28d9]"
      />
    </label>
  )

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] overflow-hidden">

      {/* ── Nav ── */}
      <nav className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-[#070b15] border-b border-white/10">
        <Link href="/dashboard" className="text-[#a78bfa] font-bold text-sm tracking-[0.24em]">FolioSage</Link>
        <div className="flex gap-2">
          {portfolio.published && portfolio.shareCode && (
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
            {portfolio.published && portfolio.shareCode ? (
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
                <button
                  onClick={unpublish}
                  disabled={publishBusy}
                  className="w-full text-left text-sm px-3 py-3 bg-[#1f1318] border border-rose-300/15 text-rose-200 rounded-xl hover:border-rose-300/35 transition-colors disabled:opacity-45"
                >
                  비공개로 전환
                </button>
              </>
            ) : (
              <button
                onClick={publish}
                disabled={publishBusy}
                className="w-full text-sm px-3 py-3 bg-[#6d28d9] hover:bg-[#7c3aed] text-white rounded-xl transition-colors disabled:opacity-45"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LinkIcon className="size-3.5" />
                  {publishBusy ? '처리 중...' : '포트폴리오 공개'}
                </span>
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto bg-[#0b1020] p-6 space-y-5">

          {/* Upload zone (compact) */}
          <FileUploadZone portfolioId={id} onUploaded={() => loadPortfolio()} compact />

          <section className="rounded-xl border border-white/10 bg-[#111827]/90 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                  <ListChecks className="size-3.5" />
                  Portfolio readiness
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">공유 전에 보여줄 증거를 정리하세요</h3>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1 text-sm font-semibold text-cyan-100">
                {readiness?.score ?? 0}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              {readinessItems.map(item => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-[#0b1020] p-3">
                  <p className={`inline-flex items-center gap-2 text-sm font-medium ${item.done ? 'text-emerald-200' : 'text-slate-300'}`}>
                    <CheckCircle2 className={`size-4 ${item.done ? 'text-emerald-300' : 'text-slate-600'}`} />
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              공개 페이지는 생성된 스토리, 증거 하이라이트, AI 질문 예시를 먼저 보여줍니다. 각 파일 설명을 채우면 방문자가 증거 맥락을 더 빨리 이해합니다.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#111827]/90 p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200">
                  <Sparkles className="size-3.5" />
                  Portfolio story
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">프로젝트 파일을 면접용 증거 스토리로 정리하세요</h3>
                {portfolio.story?.generatedAt && (
                  <p className="mt-1 text-xs text-slate-500">
                    마지막 생성: {new Date(portfolio.story.generatedAt).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={generateStory}
                  disabled={storyGenerating || files.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-400 disabled:opacity-45"
                >
                  {storyGenerating ? <Loader2 className="size-4 animate-spin" /> : <Bot className="size-4" />}
                  {portfolio.story ? '스토리 다시 생성' : 'Generate Portfolio Story'}
                </button>
                <button
                  onClick={saveStory}
                  disabled={storySaving}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07] disabled:opacity-45"
                >
                  {storySaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  저장
                </button>
              </div>
            </div>
            {storyError && <p className="mb-3 text-xs text-rose-300">{storyError}</p>}
            {portfolio.story?.errorMessage && (
              <p className="mb-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100">
                {portfolio.story.errorMessage}
              </p>
            )}
            <div className="grid gap-3 lg:grid-cols-2">
              {storyField('summary', 'Summary', '이 프로젝트를 한 문단으로 설명하세요.')}
              {storyField('role', 'My Role', '본인이 맡은 역할과 책임을 적으세요.')}
              {storyField('problem', 'Problem', '해결하려던 문제나 맥락을 적으세요.')}
              {storyField('solution', 'Solution', '접근 방식과 핵심 결정을 적으세요.')}
              <div className="lg:col-span-2">
                {storyField('impact', 'Impact', '결과, 배운 점, 측정 가능한 임팩트를 적으세요.')}
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#0b1020] p-3">
                <p className="mb-2 text-sm font-semibold text-white">Evidence Highlights</p>
                {storyForm.evidenceHighlights.length === 0 ? (
                  <p className="text-xs text-slate-500">스토리를 생성하면 핵심 증거 파일이 여기에 표시됩니다.</p>
                ) : (
                  <div className="space-y-2">
                    {storyForm.evidenceHighlights.map((item: any) => (
                      <button
                        key={`${item.fileId}-${item.vaultsageFileId}`}
                        onClick={() => {
                          const el = document.getElementById(`file-${item.fileId}`)
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }}
                        className="block w-full rounded-lg border border-emerald-300/15 bg-emerald-300/[0.045] px-3 py-2 text-left"
                      >
                        <span className="block truncate text-xs font-medium text-emerald-100">{item.fileName}</span>
                        <span className="mt-1 block text-xs leading-5 text-emerald-100/70">{item.reason}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0b1020] p-3">
                <p className="mb-2 text-sm font-semibold text-white">Interview Questions</p>
                {storyForm.interviewQuestions.length === 0 ? (
                  <p className="text-xs text-slate-500">생성된 면접 질문이 여기에 표시됩니다.</p>
                ) : (
                  <div className="space-y-2">
                    {storyForm.interviewQuestions.map((question, index) => (
                      <p key={`${question}-${index}`} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">
                        {question}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

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
                  id={`file-${file.id}`}
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
