'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
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
  GripVertical,
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

const FILE_CATEGORIES = [
  { key: 'system', label: '시스템', detail: '토큰 · 가이드 · 코드', tone: 'violet' },
  { key: 'visual', label: '비주얼', detail: '이미지 · 영상 · 디자인', tone: 'cyan' },
  { key: 'document', label: '문서', detail: '리서치 · 노트 · 기획', tone: 'amber' },
  { key: 'deliverable', label: '산출물', detail: '최종본 · 납품 · 아카이브', tone: 'emerald' },
] as const

const CATEGORY_TONES: Record<string, {
  ring: string
  soft: string
  text: string
  dot: string
  glow: string
}> = {
  system: {
    ring: 'border-violet-300/20',
    soft: 'bg-violet-300/[0.07]',
    text: 'text-violet-200',
    dot: 'bg-violet-300',
    glow: 'rgba(167,139,250,0.18)',
  },
  visual: {
    ring: 'border-cyan-300/20',
    soft: 'bg-cyan-300/[0.07]',
    text: 'text-cyan-200',
    dot: 'bg-cyan-300',
    glow: 'rgba(34,211,238,0.16)',
  },
  document: {
    ring: 'border-amber-300/20',
    soft: 'bg-amber-300/[0.07]',
    text: 'text-amber-200',
    dot: 'bg-amber-300',
    glow: 'rgba(251,191,36,0.14)',
  },
  deliverable: {
    ring: 'border-emerald-300/20',
    soft: 'bg-emerald-300/[0.07]',
    text: 'text-emerald-200',
    dot: 'bg-emerald-300',
    glow: 'rgba(52,211,153,0.16)',
  },
}

function fileFingerprint(hash?: string | null) {
  return hash ? hash.slice(0, 10) : 'pending'
}

function formatFileSize(size?: number | null) {
  if (!size || size <= 0) return 'size n/a'
  const mb = size / 1024 / 1024
  if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
  return `${Math.max(1, Math.round(size / 1024))} KB`
}

function normalizeCategory(category: string | null | undefined, mimeType?: string): string {
  if (FILE_CATEGORIES.some(item => item.key === category)) return category as string
  if (mimeType?.includes('image') || mimeType?.includes('video')) return 'visual'
  if (mimeType?.includes('zip') || mimeType?.includes('archive')) return 'deliverable'
  return 'document'
}

function PortfolioFileCard({
  file,
  categoryKey,
  categoryIndex,
  itemIndex,
  editingDesc,
  setEditingDesc,
  saveDescription,
  moveFileToCategory,
  setDeleteConfirm,
}: {
  file: any
  categoryKey: string
  categoryIndex: number
  itemIndex: number
  editingDesc: { id: string; value: string } | null
  setEditingDesc: (value: { id: string; value: string } | null) => void
  saveDescription: (fileId: string, description: string) => void
  moveFileToCategory: (fileId: string, category: string) => void
  setDeleteConfirm: (fileId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: file.id,
    data: { category: categoryKey },
  })
  const tone = CATEGORY_TONES[categoryKey] ?? CATEGORY_TONES.document
  const confidence = typeof file.categoryConfidence === 'number' ? file.categoryConfidence : null

  return (
    <div ref={setNodeRef} id={`file-${file.id}`}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1426]/88 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#111a30] animate-slide-up"
      style={{
        animationDelay: `${(categoryIndex + itemIndex) * 0.04}s`,
        opacity: isDragging ? 0.45 : 1,
        transform: CSS.Translate.toString(transform),
      }}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-24 rounded-full blur-2xl transition-opacity group-hover:opacity-100"
        style={{ background: tone.glow, opacity: 0.45 }} />
      <div className="relative flex items-start gap-3">
        <button type="button" {...attributes} {...listeners}
          className={`mt-0.5 flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg border ${tone.ring} ${tone.soft} ${tone.text} active:cursor-grabbing`}
          aria-label={`${file.name} 드래그`}>
          <GripVertical className="size-4" />
        </button>
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-200">
          <FileTypeIcon mimeType={file.mimeType} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{file.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                  <ShieldCheck className="size-3" />
                  certified
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] text-slate-500">
                  sha {fileFingerprint(file.fileHash)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] text-slate-500">
                  {formatFileSize(file.fileSize)}
                </span>
                {confidence !== null && (
                  <span className={`rounded-full border ${tone.ring} ${tone.soft} px-2 py-0.5 text-[10px] ${tone.text}`}>
                    AI {confidence}%
                  </span>
                )}
                {file.categoryLocked && <span className="rounded-full bg-emerald-300/[0.08] px-2 py-0.5 text-[10px] text-emerald-200">수동 고정</span>}
              </div>
            </div>
            <button onClick={() => setDeleteConfirm(file.id)}
              className="shrink-0 rounded-lg p-1.5 text-slate-600 transition-all hover:bg-rose-400/10 hover:text-rose-300"
              aria-label={`${file.name} 삭제`}>
              <Trash2 className="size-3.5" />
            </button>
          </div>
          {editingDesc?.id === file.id ? (
            <input autoFocus value={editingDesc!.value}
              onChange={e => setEditingDesc({ id: file.id, value: e.target.value })}
              onBlur={() => saveDescription(file.id, editingDesc!.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveDescription(file.id, editingDesc!.value)
                if (e.key === 'Escape') setEditingDesc(null)
              }}
              maxLength={200} placeholder="설명 입력..."
              className="mt-3 w-full rounded-lg border border-violet-300/40 bg-[#070b15] px-3 py-2 text-xs text-slate-200 outline-none" />
          ) : (
            <p onClick={() => setEditingDesc({ id: file.id, value: file.description ?? '' })}
              className="mt-3 min-h-[34px] cursor-pointer rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs leading-5 text-slate-400 transition-colors line-clamp-2 hover:border-white/10 hover:text-slate-200">
              {file.description || '+ 설명 추가'}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FILE_CATEGORIES.filter(item => item.key !== categoryKey).map(item => (
              <button key={item.key}
                onClick={() => moveFileToCategory(file.id, item.key)}
                className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-1 text-[10px] text-slate-500 transition-colors hover:border-violet-300/30 hover:bg-violet-300/[0.06] hover:text-violet-200">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryDropZone({
  category,
  categoryIndex,
  portfolioId,
  editingDesc,
  setEditingDesc,
  saveDescription,
  moveFileToCategory,
  setDeleteConfirm,
  loadPortfolio,
}: {
  category: any
  categoryIndex: number
  portfolioId: string
  editingDesc: { id: string; value: string } | null
  setEditingDesc: (value: { id: string; value: string } | null) => void
  saveDescription: (fileId: string, description: string) => void
  moveFileToCategory: (fileId: string, category: string) => void
  setDeleteConfirm: (fileId: string) => void
  loadPortfolio: () => void
}) {
  const { isOver, setNodeRef } = useDroppable({ id: category.key })
  const tone = CATEGORY_TONES[category.key] ?? CATEGORY_TONES.document

  return (
    <div ref={setNodeRef}
      className={`min-h-[320px] overflow-hidden rounded-2xl border p-3 backdrop-blur-sm transition-all ${
        isOver ? `${tone.ring} ${tone.soft} shadow-[0_0_0_1px_rgba(255,255,255,0.05)]` : 'border-white/10 bg-[#0b1020]/82'
      }`}>
      <div className="relative mb-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-3">
        <div aria-hidden className="absolute -right-6 -top-10 size-24 rounded-full blur-2xl"
          style={{ background: tone.glow }} />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={`flex items-center gap-2 text-sm font-semibold ${tone.text}`}>
              <span className={`size-2 rounded-full ${tone.dot}`} />
              {category.label}
            </p>
            <p className="mt-1 truncate text-[11px] text-slate-500">{category.detail}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex min-w-9 justify-center rounded-full border ${tone.ring} ${tone.soft} px-2.5 py-1 text-xs font-semibold ${tone.text}`}>
              {category.files.length}
            </span>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-600">files</p>
          </div>
        </div>
      </div>
      <FileUploadZone portfolioId={portfolioId} assignedCategory={category.key} onUploaded={loadPortfolio} compact />
      <div className="mt-3 space-y-2">
        {category.files.length === 0 ? (
          <div className={`rounded-xl border border-dashed ${tone.ring} bg-white/[0.018] px-3 py-8 text-center`}>
            <FolderOpen className={`mx-auto mb-2 size-5 ${tone.text} opacity-70`} />
            <p className="text-xs text-slate-500">파일을 업로드하거나 여기로 드래그하세요</p>
          </div>
        ) : category.files.map((file: any, i: number) => (
          <PortfolioFileCard
            key={file.id}
            file={file}
            categoryKey={category.key}
            categoryIndex={categoryIndex}
            itemIndex={i}
            editingDesc={editingDesc}
            setEditingDesc={setEditingDesc}
            saveDescription={saveDescription}
            moveFileToCategory={moveFileToCategory}
            setDeleteConfirm={setDeleteConfirm}
          />
        ))}
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [portfolio, setPortfolio] = useState<any>(null)
  const [stats, setStats] = useState({ viewCount: 0, downloadCount: 0, todayViews: 0 })
  const [organizeStatus, setOrganizeStatus] = useState({ status: 'idle', message: '분류 전' })
  const [isOrganizing, setIsOrganizing] = useState(false)
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

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
      if (data.status === 'done') loadPortfolio()
    }
  }, [id, loadPortfolio])

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
    setOrganizeStatus({ status: 'generating', message: 'AI is analyzing your files...' })
    try {
      await api.post(`/api/portfolios/${id}/organize`, null, { params: { force: true } })
      pollOrganizeStatus()
    } catch { setIsOrganizing(false) }
  }

  const moveFileToCategory = async (fileId: string, category: string) => {
    setPortfolio((prev: any) => ({
      ...prev,
      files: (prev.files ?? []).map((file: any) =>
        file.id === fileId ? { ...file, category, categoryLocked: true, categoryConfidence: 100 } : file
      ),
    }))
    try {
      await api.patch(`/api/portfolios/${id}/files/${fileId}/category`, { category })
      loadPortfolio()
    } catch {
      loadPortfolio()
    }
  }

  const handleFileDragEnd = (event: DragEndEvent) => {
    const fileId = String(event.active.id)
    const targetCategory = typeof event.over?.id === 'string' ? event.over.id : ''
    const sourceCategory = event.active.data.current?.category
    if (!FILE_CATEGORIES.some(item => item.key === targetCategory)) return
    if (sourceCategory === targetCategory) return
    moveFileToCategory(fileId, targetCategory)
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
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-6 w-32 skeleton-loading rounded mx-auto" />
          <div className="h-4 w-48 skeleton-loading rounded mx-auto" />
        </div>
      </div>
    )
  }

  const files = portfolio.files ?? []
  const describedFiles = files.filter((file: any) => file.description && file.description.trim()).length
  const filesByCategory = FILE_CATEGORIES.map(category => ({
    ...category,
    files: files.filter((file: any) => normalizeCategory(file.category, file.mimeType) === category.key),
  }))
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
        rows={key === 'summary' || key === 'impact' ? 5 : 4}
        className="min-h-[132px] w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#475569] focus:border-[#6d28d9]"
      />
    </label>
  )

  const portfolioShareUrl = portfolio.shareCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${portfolio.shareCode}`
    : ''

  const activityItems = [
    organizeStatus.status === 'done' && {
      icon: <Bot className="size-3.5" />,
      text: 'AI 분류 완료',
      time: '방금 전',
      color: 'text-violet-300',
    },
    portfolio.story?.generatedAt && {
      icon: <Wand2 className="size-3.5" />,
      text: `Portfolio Story 생성됨`,
      time: new Date(portfolio.story.generatedAt).toLocaleDateString('ko-KR'),
      color: 'text-amber-300',
    },
    portfolio.published && {
      icon: <Globe2 className="size-3.5" />,
      text: '포트폴리오 공개됨',
      time: '',
      color: 'text-emerald-300',
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: string; time: string; color: string }[]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      {/* Void background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_84%_22%,rgba(20,184,166,0.12),transparent_26%),radial-gradient(circle_at_56%_90%,rgba(245,158,11,0.08),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.25),rgba(6,9,18,0.92)_48%,rgba(6,9,18,0.65))]" />

      {/* Navbar */}
      <nav className="relative z-10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
              <ArrowLeft className="size-3.5" />
              대시보드
            </a>
            <button onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.07] hover:text-white">
              {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? '복사됨' : '공유 링크'}
            </button>
            {portfolio.published && portfolio.shareCode ? (
              <a href={`/p/${portfolio.shareCode}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6d28d9] px-3 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.28)] transition-colors hover:bg-[#7c3aed]">
                <PlayCircle className="size-3.5" />
                라이브 페이지 열기
                <ArrowUpRight className="size-3.5" />
              </a>
            ) : (
              <button onClick={publish} disabled={publishBusy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6d28d9] px-3 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.28)] transition-colors hover:bg-[#7c3aed] disabled:opacity-50">
                <Globe2 className="size-3.5" />
                {publishBusy ? '처리 중...' : '포트폴리오 공개'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-2 sm:px-8">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-300/[0.18] p-8 sm:p-10"
          style={{
            background:
              'linear-gradient(140deg, rgba(124,58,237,0.30) 0%, rgba(11,16,32,0.85) 38%, rgba(11,16,32,0.95) 70%),' +
              'radial-gradient(circle at 88% 12%, rgba(34,211,238,0.30), transparent 40%)',
            backdropFilter: 'blur(24px)',
          }}>
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, rgba(167,139,250,0.20), transparent 30%),' +
                'radial-gradient(circle at 80% 20%, rgba(34,211,238,0.18), transparent 30%)',
              mixBlendMode: 'screen',
            }} />

          <div className="relative flex flex-wrap items-start justify-between gap-8">
            {/* Left */}
            <div className="min-w-0 flex-1" style={{ flexBasis: '520px' }}>
              {/* Status pills */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  portfolio.published
                    ? 'border border-violet-300/20 bg-violet-300/[0.07] text-violet-200'
                    : 'border border-white/10 bg-white/[0.035] text-slate-400'
                }`}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {portfolio.published ? 'Live · 공개됨' : '비공개'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                  <ShieldCheck className="size-3" />
                  {files.length}개 소스
                </span>
                {readiness?.aiReviewReady && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-cyan-200">
                    <Sparkles className="size-3" />
                    AI 리뷰 완료
                  </span>
                )}
              </div>

              {/* Eyebrow */}
              <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-500">
                Portfolio{portfolio.shareCode ? ` · /p/${portfolio.shareCode}` : ''}
              </p>

              {/* Title */}
              <h1 className="mt-3 mb-2 text-4xl font-semibold leading-tight sm:text-5xl"
                style={{
                  background: 'linear-gradient(120deg, #fff 0%, #ddd6fe 60%, #a5f3fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}>
                {portfolio.title}
              </h1>

              {/* Summary */}
              <p className="max-w-2xl text-base leading-relaxed text-slate-300">
                {portfolio.story?.summary || '포트폴리오 스토리를 생성하면 요약이 여기에 표시됩니다.'}
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap gap-3">
                {portfolio.published && portfolio.shareCode && (
                  <a href={`/p/${portfolio.shareCode}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6d28d9] px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,58,237,0.28)] transition-colors hover:bg-[#7c3aed]">
                    <PlayCircle className="size-4" />
                    라이브 페이지 열기
                    <ArrowUpRight className="size-4" />
                  </a>
                )}
                {!portfolio.published && (
                  <button onClick={publish} disabled={publishBusy}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6d28d9] px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,58,237,0.28)] transition-colors hover:bg-[#7c3aed] disabled:opacity-50">
                    <Globe2 className="size-4" />
                    {publishBusy ? '처리 중...' : '포트폴리오 공개'}
                  </button>
                )}
                <button onClick={copyLink}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm text-slate-200 transition-colors hover:bg-white/[0.07]">
                  {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                  {copied ? '복사됨' : '공유 링크'}
                </button>
              </div>
              {publishError && <p className="mt-3 text-xs text-rose-300">{publishError}</p>}
            </div>

            {/* Right: AI Guide chip */}
            <div className="rounded-2xl border border-white/10 p-5 backdrop-blur-xl"
              style={{ flex: '0 0 300px', minWidth: 260, background: 'rgba(11,16,32,0.65)' }}>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-200">
                  <Bot className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">AI Guide</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {portfolio.story?.generatedAt
                      ? `마지막 생성: ${new Date(portfolio.story.generatedAt).toLocaleDateString('ko-KR')}`
                      : '스토리 생성 후 활성화'}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] ${readiness?.aiReviewReady ? 'text-emerald-300' : 'text-slate-500'}`}>
                  <span className={`size-1.5 rounded-full ${readiness?.aiReviewReady ? 'bg-emerald-300' : 'bg-slate-500'}`} />
                  {readiness?.aiReviewReady ? 'ready' : 'pending'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {files.length}개 파일
                {readiness?.aiReviewReady
                  ? ' · AI 리뷰 완료. 방문자가 어떤 질문을 해도 근거를 인용해 답변합니다.'
                  : ' · 스토리 생성 및 공개 설정 후 AI 리뷰를 진행하세요.'}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700"
                  style={{ width: readiness?.aiReviewReady ? '100%' : storyReady ? '65%' : files.length > 0 ? '30%' : '5%' }} />
              </div>
              <button
                onClick={() => setTab('story')}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.07]">
                <Sparkles className="size-3.5" />
                스토리 편집
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="mt-6 flex w-fit gap-1 rounded-xl border border-white/10 bg-[#0b1020]/90 p-1 backdrop-blur-xl">
          {([
            { key: 'story', label: '스토리', Icon: Layers },
            { key: 'files', label: '파일', Icon: FileStack },
            { key: 'activity', label: '활동', Icon: Compass },
          ] as const).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === key ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Body: two columns ── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">

          {/* Left: tab content */}
          <div>
            {/* ── Story tab ── */}
            {tab === 'story' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6 backdrop-blur-xl">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-violet-200">포트폴리오 스토리</p>
                      <h3 className="mt-1 text-base font-semibold text-white">프로젝트 파일을 면접용 증거 스토리로 정리하세요</h3>
                      {portfolio.story?.generatedAt && (
                        <p className="mt-1 text-xs text-slate-500">
                          마지막 생성: {new Date(portfolio.story.generatedAt).toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={generateStory} disabled={storyGenerating || files.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-400 disabled:opacity-45">
                        {storyGenerating ? <Loader2 className="size-4 animate-spin" /> : <Bot className="size-4" />}
                        {portfolio.story ? '다시 생성' : '스토리 생성'}
                      </button>
                      <button onClick={saveStory} disabled={storySaving}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07] disabled:opacity-45">
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
                    {storyField('summary', '요약', '이 프로젝트를 한 문단으로 설명하세요.')}
                    {storyField('role', '내 역할', '본인이 맡은 역할과 책임을 적으세요.')}
                    {storyField('problem', '문제', '해결하려던 문제나 맥락을 적으세요.')}
                    {storyField('solution', '해결', '접근 방식과 핵심 결정을 적으세요.')}
                    <div className="lg:col-span-2">
                      {storyField('impact', '임팩트', '결과, 배운 점, 측정 가능한 임팩트를 적으세요.')}
                    </div>
                  </div>
                </div>

                {/* Evidence highlights + interview questions */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 backdrop-blur-xl">
                    <p className="mb-3 text-sm font-semibold text-white">핵심 근거</p>
                    {storyForm.evidenceHighlights.length === 0 ? (
                      <p className="text-xs text-slate-500">스토리를 생성하면 핵심 증거 파일이 여기에 표시됩니다.</p>
                    ) : (
                      <div className="space-y-2">
                        {storyForm.evidenceHighlights.map((item: any) => (
                          <button key={`${item.fileId}-${item.vaultsageFileId}`}
                            onClick={() => {
                              const el = document.getElementById(`file-${item.fileId}`)
                              if (el) { setTab('files'); setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100) }
                            }}
                            className="block w-full rounded-lg border border-emerald-300/15 bg-emerald-300/[0.045] px-3 py-2 text-left">
                            <span className="block truncate text-xs font-medium text-emerald-100">{item.fileName}</span>
                            <span className="mt-1 block text-xs leading-5 text-emerald-100/70">{item.reason}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 backdrop-blur-xl">
                    <p className="mb-3 text-sm font-semibold text-white">면접 질문</p>
                    {storyForm.interviewQuestions.length === 0 ? (
                      <p className="text-xs text-slate-500">생성된 면접 질문이 여기에 표시됩니다.</p>
                    ) : (
                      <div className="space-y-2">
                        {storyForm.interviewQuestions.map((q, idx) => (
                          <p key={`${q}-${idx}`} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">{q}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Readiness + Defense room */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-200">Portfolio readiness</p>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1 text-sm font-semibold text-cyan-100">
                      {readiness?.score ?? 0}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    {readinessItems.map(item => (
                      <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                        <p className={`inline-flex items-center gap-2 text-sm font-medium ${item.done ? 'text-emerald-200' : 'text-slate-300'}`}>
                          <CheckCircle2 className={`size-4 ${item.done ? 'text-emerald-300' : 'text-slate-600'}`} />
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <DefenseRoom portfolioId={id} published={portfolio.published} fileCount={portfolio.files?.length ?? 0} />
              </div>
            )}

            {/* ── Files tab ── */}
            {tab === 'files' && (
              <div className="space-y-4">
                {files.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1020]/70 p-4">
                    <div className="mb-4 text-center">
                      <UploadCloud className="mx-auto mb-3 size-10 text-slate-600" />
                      <p className="text-sm text-slate-400">원하는 분야 칸에서 파일을 바로 추가하세요.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      {filesByCategory.map((category, categoryIndex) => (
                        <CategoryDropZone
                          key={category.key}
                          category={category}
                          categoryIndex={categoryIndex}
                          portfolioId={id}
                          editingDesc={editingDesc}
                          setEditingDesc={setEditingDesc}
                          saveDescription={saveDescription}
                          moveFileToCategory={moveFileToCategory}
                          setDeleteConfirm={setDeleteConfirm}
                          loadPortfolio={loadPortfolio}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <DndContext sensors={sensors} onDragEnd={handleFileDragEnd}>
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      {filesByCategory.map((category, categoryIndex) => (
                        <CategoryDropZone
                          key={category.key}
                          category={category}
                          categoryIndex={categoryIndex}
                          portfolioId={id}
                          editingDesc={editingDesc}
                          setEditingDesc={setEditingDesc}
                          saveDescription={saveDescription}
                          moveFileToCategory={moveFileToCategory}
                          setDeleteConfirm={setDeleteConfirm}
                          loadPortfolio={loadPortfolio}
                        />
                      ))}
                    </div>
                  </DndContext>
                )}
              </div>
            )}

            {/* ── Activity tab ── */}
            {tab === 'activity' && (
              <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 backdrop-blur-xl overflow-hidden">
                {activityItems.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <p className="text-sm">활동 기록이 없습니다.</p>
                  </div>
                ) : (
                  activityItems.map((item, i) => (
                    <div key={i} className={`flex items-start gap-4 p-5 ${i < activityItems.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ${item.color}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-200">{item.text}</p>
                        {item.time && <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">
            {/* Meta summary */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 backdrop-blur-xl">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">요약</p>
              <div className="space-y-3">
                {[
                  ['파일', `${files.length}개`],
                  ['통계', `조회 ${stats.viewCount} · 다운 ${stats.downloadCount}`],
                  ['오늘 조회', `${stats.todayViews}회`],
                  ...(portfolio.shareCode ? [['공유 링크', `/p/${portfolio.shareCode}`]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 text-xs">
                    <span className="shrink-0 uppercase tracking-[0.18em] text-slate-500">{k}</span>
                    <span className="text-right text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI organize */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 backdrop-blur-xl">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">AI 분류</p>
              <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm ${
                organizeStatus.status === 'done'   ? 'border-emerald-300/15 bg-emerald-300/[0.04] text-emerald-200' :
                organizeStatus.status === 'failed' ? 'border-rose-300/15 bg-rose-300/[0.04] text-rose-200' :
                ['generating','applying','materializing'].includes(organizeStatus.status)
                  ? 'border-violet-300/15 bg-violet-300/[0.04] text-violet-200' :
                  'border-white/10 bg-white/[0.035] text-slate-500'
              }`}>
                {organizeStatus.status === 'done' ? <CheckCircle2 className="size-4" /> :
                 organizeStatus.status === 'failed' ? <XCircle className="size-4" /> :
                 ['generating','applying','materializing'].includes(organizeStatus.status) ? <Loader2 className="size-4 animate-spin" /> :
                 <CirclePause className="size-4" />}
                <span className="flex-1 truncate text-xs">{organizeStatus.message}</span>
              </div>
              {files.length > 0 && !['generating','applying','materializing'].includes(organizeStatus.status) && (
                <button onClick={startOrganize} disabled={isOrganizing}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#6d28d9] bg-violet-900/30 py-2.5 text-xs text-violet-200 transition-colors hover:bg-violet-900/50 disabled:opacity-40">
                  <Bot className="size-3.5" />
                  {isOrganizing ? '분석 중...' : organizeStatus.status === 'done' ? 'AI로 다시 분류' : 'AI 분류 시작'}
                </button>
              )}
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 backdrop-blur-xl">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">위험한 영역</p>
              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                포트폴리오를 비공개로 전환하거나 영구 삭제합니다.
              </p>
              <div className="flex gap-2">
                {portfolio.published && (
                  <button onClick={unpublish} disabled={publishBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.07] disabled:opacity-50">
                    비공개로 전환
                  </button>
                )}
                <button onClick={() => setDeleteConfirm('__portfolio__')}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-rose-300 transition-colors hover:bg-rose-400/10">
                  <Trash2 className="size-3.5" />
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && deleteConfirm !== '__portfolio__' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="mx-4 w-full max-w-sm animate-spring-in rounded-2xl border border-white/10 bg-[#1e293b] p-6">
            <h3 className="mb-2 text-base font-bold text-white">파일 삭제</h3>
            <p className="mb-5 text-sm text-slate-400">이 파일을 삭제하면 복구할 수 없습니다. 계속하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-white/[0.05] transition-colors">취소</button>
              <button onClick={() => deleteFile(deleteConfirm)} className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white transition-colors hover:bg-rose-400">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
