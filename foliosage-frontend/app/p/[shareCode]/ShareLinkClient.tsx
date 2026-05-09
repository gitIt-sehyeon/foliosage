'use client'
import { useEffect, useState } from 'react'
import {
  Archive,
  Bot,
  CheckCircle2,
  Download,
  Eye,
  File,
  FileCheck2,
  FileText,
  FolderOpen,
  ImageIcon,
  MessageSquareText,
  SearchX,
  ShieldCheck,
  Sparkles,
  Video,
  ClipboardCheck,
  XCircle,
} from 'lucide-react'
import ChatPanel from '@/components/ChatPanel'
import FileLightbox from '@/components/FileLightbox'
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
  story: {
    summary: string | null
    role: string | null
    problem: string | null
    solution: string | null
    impact: string | null
    evidenceHighlights: { fileId: string; vaultsageFileId: string; fileName: string; reason: string }[]
    missingProof: string[]
    interviewQuestions: string[]
  } | null
}

function FileTypeIcon({ mimeType, className = 'size-4' }: { mimeType: string; className?: string }) {
  const Icon = mimeType?.includes('pdf') ? FileText
    : mimeType?.includes('image') ? ImageIcon
    : mimeType?.includes('video') ? Video
    : mimeType?.includes('zip') || mimeType?.includes('archive') ? Archive
    : File
  return <Icon className={className} />
}

function creatorInitials(name: string | null | undefined) {
  return (name || 'FS')
    .split(/\s+/)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ShareLinkClient({ shareCode }: { shareCode: string }) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [defenseOpen, setDefenseOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
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

  const suggestedQuestions = portfolio?.story?.interviewQuestions?.length
    ? portfolio.story.interviewQuestions
    : portfolio ? [
      `이 포트폴리오에서 ${portfolio.ownerName ?? '작성자'}의 역할은 무엇인가요?`,
      '가장 강한 증거 파일 3개를 근거와 함께 설명해 주세요.',
      '심사자 관점에서 보완하면 좋을 증거는 무엇인가요?',
    ] : []
  const story = portfolio?.story
  const storySections = portfolio ? [
    { label: 'Role', value: story?.role },
    { label: 'Problem', value: story?.problem },
    { label: 'Solution', value: story?.solution },
    { label: 'Impact', value: story?.impact },
  ].filter(item => item.value && item.value.trim()) : []

  const BENTO_PATTERNS = [
    { span: 'tall', tone: 'violet' },
    { span: 'wide', tone: 'cyan' },
    { span: 'sq',   tone: 'amber' },
    { span: 'sq',   tone: 'emerald' },
    { span: 'wide', tone: 'violet' },
    { span: 'sq',   tone: 'cyan' },
  ] as const

  const FILE_TONES = {
    violet:  { bg: 'rgba(167,139,250,0.10)', fg: '#ddd6fe', glow: 'rgba(167,139,250,0.30)' },
    cyan:    { bg: 'rgba(103,232,249,0.10)', fg: '#cffafe', glow: 'rgba(103,232,249,0.30)' },
    amber:   { bg: 'rgba(252,211,77,0.10)',  fg: '#fde68a', glow: 'rgba(252,211,77,0.30)' },
    emerald: { bg: 'rgba(110,231,183,0.10)', fg: '#a7f3d0', glow: 'rgba(110,231,183,0.30)' },
  } as const

  type ToneKey = keyof typeof FILE_TONES

  const bentoFiles = (portfolio?.files ?? []).map((f, i) => ({
    ...f,
    ...BENTO_PATTERNS[i % BENTO_PATTERNS.length],
  }))

  const isPdfFile = (f: FileItem) =>
    f.mimeType?.toLowerCase().includes('pdf') || f.name.toLowerCase().endsWith('.pdf')

  const isImageFile = (f: FileItem) => f.mimeType?.toLowerCase().includes('image')

  const openModal = (file: FileItem) => {
    setSelectedFile(file)
    setModalOpen(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      {/* Void background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_80%_22%,rgba(20,184,166,0.12),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.25),rgba(6,9,18,0.92)_48%,rgba(6,9,18,0.65))]" />

      {/* ── Top bar ── */}
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#070b15]/90 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          {loading ? (
            <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          ) : (
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              방문자 화면 · {portfolio?.ownerName ?? ''}의 포트폴리오
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!loading && portfolio && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-200">
              <CheckCircle2 className="size-3" />
              FolioSage 검증
            </span>
          )}
          {portfolio && portfolio.viewCount > 0 && (
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
              <Eye className="size-3.5" />
              <CountUpNumber target={portfolio.viewCount} />
            </span>
          )}
          <button onClick={handleDownload} disabled={!selectedFile || loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-40">
            <Download className="size-3.5" />
            다운로드
          </button>
          <button
            onClick={() => { setDefenseOpen(v => !v); if (!defenseOpen) setChatOpen(false) }}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
              defenseOpen ? 'border-emerald-300/25 bg-emerald-600 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white'
            }`}>
            <ClipboardCheck className="size-3.5" />
            AI 리뷰
          </button>
          <button
            onClick={() => { setChatOpen(v => !v); if (!chatOpen) setDefenseOpen(false) }}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
              chatOpen ? 'border-violet-300/25 bg-[#6d28d9] text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white'
            }`}>
            <MessageSquareText className="size-3.5" />
            AI 채팅
          </button>
        </div>
      </header>

      {/* ── Main: article + chat sidebar ── */}
      <div
        className="relative z-10 transition-[grid-template-columns]"
        style={{
          display: 'grid',
          gridTemplateColumns: chatOpen ? '1fr 400px' : '1fr',
          minHeight: 'calc(100vh - 64px)',
          transitionDuration: '0.5s',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>

        {/* ── Magazine article ── */}
        <article className="overflow-y-auto" style={{ padding: '40px 32px 120px', maxWidth: 880, margin: '0 auto', width: '100%' }}>

          {loading ? (
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-24 w-full animate-pulse rounded-xl bg-white/[0.04]" />
              <div className="h-64 w-full animate-pulse rounded-2xl bg-white/[0.04]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32">
              <SearchX className="mb-4 size-12 text-slate-600" />
              <p className="text-slate-400">{error}</p>
            </div>
          ) : portfolio ? (
            <>
              {/* ── Magazine hero ── */}
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-violet-200">
                    <span className="size-1.5 rounded-full bg-violet-300" />
                    Live
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-cyan-200">
                    <Sparkles className="size-3" />
                    AI reviewed
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                    <ShieldCheck className="size-3" />
                    {portfolio.files.filter(f => f.certifiedAt).length} verified
                  </span>
                </div>

                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
                  Portfolio · {portfolio.ownerName ?? ''}
                </p>

                <h1 className="mt-3 text-6xl font-semibold leading-none sm:text-7xl"
                  style={{
                    background: 'linear-gradient(120deg, #fff 0%, #ddd6fe 50%, #67e8f9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.025em',
                    lineHeight: 0.98,
                  }}>
                  {portfolio.title}
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
                  {story?.summary || portfolio.description || '이 포트폴리오에서 작업의 맥락, 증거 파일, AI 가이드를 확인하세요.'}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                      {creatorInitials(portfolio.ownerName)}
                    </span>
                    <span className="font-semibold text-slate-200">{portfolio.ownerName ?? 'Creator'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-3.5" />
                    {portfolio.viewCount.toLocaleString()} views
                  </span>
                  <span>{portfolio.files.length}개 파일</span>
                </div>
              </div>

              {/* ── Hero artwork ── */}
              <div className="mt-10 relative h-72 sm:h-80 overflow-hidden rounded-2xl border border-white/[0.08]"
                style={{
                  background:
                    'radial-gradient(circle at 25% 30%, rgba(167,139,250,0.55), transparent 50%),' +
                    'radial-gradient(circle at 80% 65%, rgba(34,211,238,0.40), transparent 55%),' +
                    'radial-gradient(circle at 60% 20%, rgba(245,158,11,0.35), transparent 45%),' +
                    'linear-gradient(135deg, #1e1b4b, #0b1020 60%, #0f172a)',
                }}>
                <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1020]/70 px-4 py-2 text-xs text-slate-300 backdrop-blur-md">
                  <Bot className="size-3.5 text-amber-300" />
                  {portfolio.files[0]?.name ?? 'Portfolio files'}
                </div>
                {portfolio.files[0]?.fileHash && (
                  <div className="absolute right-5 top-5 font-mono text-[11px] text-white/40">
                    #{portfolio.files[0].fileHash.slice(0, 8)} · verified
                  </div>
                )}
              </div>

              {/* ── Story section ── */}
              {storySections.length > 0 && (
                <section className="mt-14">
                  <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.26em] text-slate-500">The story</p>
                  <div className="space-y-3">
                    {storySections.map(({ label, value }, i) => (
                      <div key={label}
                        className="group rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6 backdrop-blur-sm transition-all hover:border-[#6d28d9]/60 hover:bg-[#111827]">
                        <div className="flex gap-5">
                          <span className="shrink-0 font-mono text-xs text-slate-600">0{i + 1}</span>
                          <div className="flex-1">
                            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-300">{label}</p>
                            <p className="text-base leading-relaxed text-slate-200">{value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Evidence bento grid ── */}
              {portfolio.files.length > 0 && (
                <section className="mt-14">
                  <div className="mb-4 flex items-baseline justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-500">Evidence · {portfolio.files.length} files</p>
                    <span className="text-[11px] text-slate-600">모두 해시 + 타임스탬프 인증</span>
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '110px' }}>
                    {bentoFiles.map((f) => {
                      const tone = FILE_TONES[f.tone as ToneKey]
                      const spanStyle =
                        f.span === 'wide' ? { gridColumn: 'span 2' } :
                        f.span === 'tall' ? { gridRow: 'span 2' } : {}
                      return (
                        <button key={f.id}
                          onClick={() => openModal(f)}
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/90 p-4 text-left backdrop-blur-sm transition-all hover:border-[#6d28d9]/60 hover:bg-[#111827]"
                          style={spanStyle}>
                          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60"
                            style={{ background: `radial-gradient(circle at 100% 0%, ${tone.glow}, transparent 50%)` }} />
                          <div className="relative flex h-full flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="flex size-9 items-center justify-center rounded-xl"
                                style={{ background: tone.bg, color: tone.fg }}>
                                <FileCheck2 className="size-4" />
                              </span>
                              <span className="font-mono text-[10px] text-slate-600">
                                .{f.name.split('.').pop()?.toLowerCase() ?? 'file'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{f.name.replace(/\.[^.]+$/, '')}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-400">{f.description || 'Certified source file'}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* ── Closing CTA ── */}
              <section className="mt-16 rounded-2xl border border-violet-300/[0.18] p-12 text-center"
                style={{ background: 'linear-gradient(140deg, rgba(124,58,237,0.20), rgba(11,16,32,0.70) 70%)' }}>
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-500">이 포트폴리오에 대해</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
                  AI Guide에게 무엇이든 물어보세요
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                  {portfolio.files.length}개 파일을 기반으로 답변하며, 인용한 소스를 항상 표기합니다.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.slice(0, 4).map(q => (
                    <button key={q}
                      onClick={() => { setChatOpen(true); setDefenseOpen(false) }}
                      className="rounded-full border border-violet-300/30 bg-violet-300/[0.07] px-4 py-2.5 text-sm text-violet-100 transition-colors hover:bg-violet-300/[0.12]">
                      {q}
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </article>

        {/* ── Chat sidebar ── */}
        {chatOpen && (
          <aside className="border-l border-white/10 bg-[#070b15]/95 backdrop-blur-xl"
            style={{ position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <ChatPanel shareCode={shareCode} dark suggestedQuestions={suggestedQuestions} />
          </aside>
        )}
      </div>

      {/* ── File lightbox modal ── */}
      {modalOpen && selectedFile && (
        <FileLightbox
          name={selectedFile.name}
          fileHash={selectedFile.fileHash}
          pdfUrl={isPdfFile(selectedFile) ? pdfViewerUrl(selectedFile) : null}
          imageUrl={isImageFile(selectedFile) ? previewUrl(selectedFile) : null}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Defense panel ── */}
      <PublicDefensePanel
        shareCode={shareCode}
        open={defenseOpen}
        onClose={() => setDefenseOpen(false)}
        onSelectEvidence={selectEvidenceFile}
      />
    </div>
  )
}
