# FolioSage Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the FolioSage design system across all five screens (Dashboard, Auth, Portfolio Detail, Public Portfolio Viewer) to match the approved design bundle.

**Architecture:** Each page is a self-contained Next.js route. All state management and API calls are preserved; only JSX structure and Tailwind classes change. A new file-lightbox component is extracted for the public portfolio viewer.

**Tech Stack:** Next.js (App Router, `'use client'`), TypeScript, Tailwind CSS v4, lucide-react, shadcn/ui components.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `app/dashboard/page.tsx` | Nav container gets `max-w-7xl mx-auto` |
| Modify | `app/portfolios/[id]/page.tsx` | Remove sidebar; add hero banner, tab bar, two-column body |
| Create | `components/FileLightbox.tsx` | Modal for viewing PDF/image files |
| Modify | `app/p/[shareCode]/ShareLinkClient.tsx` | Replace split viewer with magazine layout + chat sidebar |

Auth pages (`app/login/page.tsx`, `app/signup/page.tsx`) already match the design — no changes needed.

---

## Task 1: Dashboard — center the nav

**Files:**
- Modify: `app/dashboard/page.tsx:136-166`

- [ ] **Step 1: Wrap nav content in max-w-7xl**

In `app/dashboard/page.tsx`, find the `<nav>` element (line 136) and add `max-w-7xl mx-auto` so the logo + buttons align with the card content below. Change:

```tsx
      <nav className="relative z-10 flex justify-between items-center px-5 py-5 sm:px-8">
```

to:

```tsx
      <nav className="relative z-10 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
```

and close the inner div before `</nav>`:

```tsx
        </div>
      </nav>
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "style: center dashboard nav to max-w-7xl"
```

---

## Task 2: Portfolio Detail — hero banner + tab bar (imports & state)

**Files:**
- Modify: `app/portfolios/[id]/page.tsx` — update imports and add `tab` state

- [ ] **Step 1: Replace the import block**

Replace the entire lucide import line at the top of `app/portfolios/[id]/page.tsx` with:

```tsx
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Compass,
  Copy,
  FileCheck2,
  FileStack,
  FileText,
  Globe2,
  ImageIcon,
  Archive,
  Layers,
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
  CirclePause,
  File,
} from 'lucide-react'
```

- [ ] **Step 2: Add tab state**

Inside `PortfolioPage`, after the existing state declarations (after `storyError` state), add:

```tsx
  const [tab, setTab] = useState<'story' | 'files' | 'activity'>('story')
```

- [ ] **Step 3: Verify the file still compiles**

```bash
cd /home/tpgus/foliosage/foliosage-frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors for this file (other files may have pre-existing issues).

- [ ] **Step 4: Commit**

```bash
git add app/portfolios/[id]/page.tsx
git commit -m "style(portfolio-detail): add tab state, update lucide imports"
```

---

## Task 3: Portfolio Detail — replace the layout (return statement)

**Files:**
- Modify: `app/portfolios/[id]/page.tsx` — replace entire `return` statement

All `loadPortfolio`, `loadStats`, `loadReadiness`, `pollOrganizeStatus`, `startOrganize`, `publish`, `unpublish`, `copyLink`, `deleteFile`, `saveDescription`, `generateStory`, `saveStory` handlers stay unchanged. Only what is rendered changes.

- [ ] **Step 1: Replace loading skeleton background**

Find:
```tsx
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
```
Replace with:
```tsx
    return (
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
```

- [ ] **Step 2: Replace the main return statement**

Find the line `return (` that begins the main return (the one that renders the `h-screen flex flex-col` layout) and replace everything from that `return (` to the closing `  )` with:

```tsx
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
                    AI reviewed
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
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-violet-200">Portfolio story</p>
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
                        {portfolio.story ? '다시 생성' : 'Generate Story'}
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
                    {storyField('summary', 'Summary', '이 프로젝트를 한 문단으로 설명하세요.')}
                    {storyField('role', 'My Role', '본인이 맡은 역할과 책임을 적으세요.')}
                    {storyField('problem', 'Problem', '해결하려던 문제나 맥락을 적으세요.')}
                    {storyField('solution', 'Solution', '접근 방식과 핵심 결정을 적으세요.')}
                    <div className="lg:col-span-2">
                      {storyField('impact', 'Impact', '결과, 배운 점, 측정 가능한 임팩트를 적으세요.')}
                    </div>
                  </div>
                </div>

                {/* Evidence highlights + interview questions */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 backdrop-blur-xl">
                    <p className="mb-3 text-sm font-semibold text-white">Evidence Highlights</p>
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
                    <p className="mb-3 text-sm font-semibold text-white">Interview Questions</p>
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
                <FileUploadZone portfolioId={id} onUploaded={() => loadPortfolio()} compact />
                {files.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1020]/70 py-16 text-center">
                    <UploadCloud className="mx-auto mb-3 size-10 text-slate-600" />
                    <p className="text-sm text-slate-400">파일을 업로드하면 여기에 표시됩니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {files.map((file: any, i: number) => (
                      <div key={file.id} id={`file-${file.id}`}
                        className="group relative rounded-2xl border border-white/10 bg-[#0b1020]/90 p-4 backdrop-blur-sm transition-all hover:border-[#6d28d9]/70 hover:bg-[#111827] animate-slide-up"
                        style={{ animationDelay: `${i * 0.06}s` }}>
                        <button onClick={() => setDeleteConfirm(file.id)}
                          className="absolute right-3 top-3 rounded p-1 text-rose-400 opacity-0 transition-all hover:bg-rose-400/10 group-hover:opacity-100">
                          <Trash2 className="size-3.5" />
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.07] text-violet-200">
                            <FileCheck2 className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate pr-6 text-sm font-medium text-white">{file.name}</p>
                            {editingDesc?.id === file.id ? (
                              <input autoFocus value={editingDesc.value}
                                onChange={e => setEditingDesc({ id: file.id, value: e.target.value })}
                                onBlur={() => saveDescription(file.id, editingDesc.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveDescription(file.id, editingDesc.value)
                                  if (e.key === 'Escape') setEditingDesc(null)
                                }}
                                maxLength={200} placeholder="설명 입력..."
                                className="mt-1 w-full rounded-lg border border-[#6d28d9] bg-[#0f172a] px-2 py-1 text-xs text-slate-300 outline-none" />
                            ) : (
                              <p onClick={() => setEditingDesc({ id: file.id, value: file.description ?? '' })}
                                className="mt-1 min-h-[16px] cursor-pointer truncate text-xs text-slate-500 transition-colors hover:text-slate-300">
                                {file.description || '+ 설명 추가'}
                              </p>
                            )}
                          </div>
                          <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
                        </div>
                      </div>
                    ))}
                  </div>
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
              {files.length > 0 && (organizeStatus.status === 'idle' || organizeStatus.status === 'failed' || organizeStatus.status === 'done') && (
                <button onClick={startOrganize} disabled={isOrganizing}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#6d28d9] bg-violet-900/30 py-2.5 text-xs text-violet-200 transition-colors hover:bg-violet-900/50 disabled:opacity-40">
                  <Bot className="size-3.5" />
                  {isOrganizing ? '분석 중...' : 'AI 분류 시작'}
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
```

- [ ] **Step 3: Fix the `storyField` helper to match scope**

The `storyField` function is defined inside `PortfolioPage` and uses `storyForm`/`setStoryForm`. Confirm it is still defined before the return statement and has not been removed. No change needed if it's intact.

- [ ] **Step 4: Verify TypeScript**

```bash
cd /home/tpgus/foliosage/foliosage-frontend && npx tsc --noEmit 2>&1 | grep "portfolios" | head -20
```

Expected: no errors in `app/portfolios/[id]/page.tsx`.

- [ ] **Step 5: Commit**

```bash
git add app/portfolios/[id]/page.tsx
git commit -m "feat(portfolio-detail): redesign with hero banner, tab bar, and two-column body"
```

---

## Task 4: Create FileLightbox component

**Files:**
- Create: `components/FileLightbox.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'
import { XCircle, ShieldCheck } from 'lucide-react'

interface Props {
  name: string
  fileHash: string
  pdfUrl: string | null   // non-null → show iframe
  imageUrl: string | null // non-null → show img
  onClose: () => void
}

export default function FileLightbox({ name, fileHash, pdfUrl, imageUrl, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070b15] shadow-2xl shadow-black/60"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <button onClick={onClose} className="ml-4 shrink-0 text-slate-400 transition-colors hover:text-white">
            <XCircle className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {pdfUrl ? (
            <iframe src={pdfUrl} className="h-full w-full border-0" title={name} />
          ) : imageUrl ? (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.12),transparent_40%)] p-6">
              <img src={imageUrl} alt={name} className="max-h-full max-w-full rounded-xl object-contain" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <p className="text-sm">미리보기를 지원하지 않는 파일 형식입니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-5 py-3">
          <span className="inline-flex items-center gap-2 text-xs text-emerald-200">
            <ShieldCheck className="size-4" />
            Certified source
          </span>
          <span className="font-mono text-[11px] text-slate-500">{fileHash.slice(0, 24)}…</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/tpgus/foliosage/foliosage-frontend && npx tsc --noEmit 2>&1 | grep "FileLightbox" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/FileLightbox.tsx
git commit -m "feat: add FileLightbox component for public portfolio file previews"
```

---

## Task 5: Public Portfolio — magazine layout

**Files:**
- Modify: `app/p/[shareCode]/ShareLinkClient.tsx` — complete redesign of JSX

All existing state, effects, and handlers are preserved. `compactChat` state is removed (no longer needed). `modalOpen` state is added.

- [ ] **Step 1: Update imports**

Replace the lucide import block at the top with:

```tsx
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
```

Add the `FileLightbox` import after the existing component imports:

```tsx
import FileLightbox from '@/components/FileLightbox'
```

- [ ] **Step 2: Update state declarations**

Remove the `compactChat` state and its resize effect. Add `modalOpen`:

Remove:
```tsx
  const [compactChat, setCompactChat] = useState(false)
```
And its effect block:
```tsx
  useEffect(() => {
    const sync = () => setCompactChat(window.innerWidth < 980)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])
```

Add after the existing state declarations:
```tsx
  const [modalOpen, setModalOpen] = useState(false)
```

- [ ] **Step 3: Add bento layout helpers**

Add these constants before the `return` statement (after the `suggestedQuestions` derivation):

```tsx
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
```

Note: remove the standalone `isPdfFile` function that already exists at the top of the file (it will conflict with the inline one above). Actually, keep the top-level `isPdfFile` function or consolidate — the cleanest approach is to remove the standalone function definition near the top (around line 64-66) and use only the one defined inline before the return, inside the component. Alternatively, just leave both and rename the inner one. The safest is to remove the module-level `isPdfFile` function definition and use the one inside the component.

- [ ] **Step 4: Replace the entire return statement**

Replace from `return (` to the final `  )` with:

```tsx
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
```

- [ ] **Step 5: Remove unused `isPdfFile` module-level function**

The `isPdfFile` function defined at module level (around line 64) is now replaced by the inline version. Find and remove:

```tsx
function isPdfFile(file: FileItem) {
  return file.mimeType?.toLowerCase().includes('pdf') || file.name.toLowerCase().endsWith('.pdf')
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /home/tpgus/foliosage/foliosage-frontend && npx tsc --noEmit 2>&1 | grep "ShareLink" | head -20
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/p/[shareCode]/ShareLinkClient.tsx components/FileLightbox.tsx
git commit -m "feat(public-portfolio): magazine layout with bento grid, hero, and chat sidebar"
```

---

## Task 6: Smoke test

- [ ] **Step 1: Start dev server**

```bash
cd /home/tpgus/foliosage/foliosage-frontend && npm run dev 2>&1 &
```

Wait ~10 seconds for startup.

- [ ] **Step 2: Check for compilation errors**

```bash
curl -s http://localhost:3000 -o /dev/null -w "%{http_code}"
```

Expected: `200`.

- [ ] **Step 3: Check Next.js build output**

```bash
cd /home/tpgus/foliosage/foliosage-frontend && npm run build 2>&1 | tail -30
```

Expected: build completes with no TypeScript errors. Warnings are acceptable.

- [ ] **Step 4: Final commit if any lint fixes needed**

```bash
git add -A
git commit -m "fix: post-design-system lint and type fixes"
```

---

## Self-Review Checklist

| Spec requirement | Covered by task |
|-----------------|----------------|
| Dashboard nav `max-w-7xl` | Task 1 |
| Portfolio detail hero banner with gradient title | Task 3 |
| Portfolio detail tab bar (Story / 파일 / 활동) | Task 3 |
| Portfolio detail two-column body | Task 3 |
| Portfolio detail: all API calls preserved | Task 3 (all handlers unchanged) |
| Portfolio detail: AI organize, defense room preserved | Task 3 |
| Public portfolio: magazine article layout | Task 5 |
| Public portfolio: bento file grid | Task 5 |
| Public portfolio: sticky chat sidebar | Task 5 |
| Public portfolio: file lightbox modal | Task 4 + 5 |
| Public portfolio: top bar kept | Task 5 |
| Auth pages: no changes needed (already match) | — |
| Landing: no changes needed (already matches) | — |
