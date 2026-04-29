# FolioSage v2 — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full Dark Premium UI redesign — animations, share link page PDF viewer, file deletion, file descriptions, visitor stats, public user profile page, and OG meta tags.

**Architecture:** Modify existing pages in-place (no new routing layer). Server component wrappers for pages needing OG metadata. All animation keyframes in `globals.css` as CSS classes — no new animation library. Backend plan (`2026-04-29-foliosage-v2-backend.md`) must be fully applied before this plan (new API endpoints are required).

**Tech Stack:** Next.js 16.2.4 (App Router), React 19, TypeScript, Tailwind v4, tw-animate-css (already installed), Axios, lucide-react

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/globals.css` | Dark Premium keyframes + utility CSS classes |
| Create | `components/ui/CountUpNumber.tsx` | rAF count-up animation component |
| Modify | `components/ChatPanel.tsx` | Add `dark?: boolean` prop for dark theme |
| Modify | `components/FileUploadZone.tsx` | Add `compact?: boolean` prop |
| Modify | `app/p/[shareCode]/page.tsx` | Convert to server component + `generateMetadata` |
| Create | `app/p/[shareCode]/ShareLinkClient.tsx` | Full dark share link UI (client component) |
| Modify | `app/portfolios/[id]/page.tsx` | Sidebar + file grid redesign with delete + descriptions + stats |
| Create | `app/u/[username]/page.tsx` | Server component + `generateMetadata` for profile |
| Create | `app/u/[username]/ProfileClient.tsx` | Dark profile page UI (client component) |
| Modify | `app/dashboard/page.tsx` | Add profile edit section + nav link to own profile |

---

### Task 1: CSS Animations + Dark Premium Classes

**Files:**
- Modify: `foliosage-frontend/app/globals.css`

- [ ] **Step 1: Append animation keyframes and utility classes to globals.css**

Open `app/globals.css`. After the existing `@theme inline { ... }` block (after the closing `}`), append the following:

```css
/* ─── Dark Premium Keyframes ─── */
@keyframes aurora {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes dp-float {
  0%, 100% { transform: translateY(0px); opacity: 0.6; }
  50%       { transform: translateY(-10px); opacity: 1; }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 16px rgba(109, 40, 217, 0.3); }
  50%       { box-shadow: 0 0 28px rgba(109, 40, 217, 0.7), 0 0 48px rgba(109, 40, 217, 0.3); }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes spring-in {
  from { transform: scale(0.92) translateY(8px); opacity: 0; }
  to   { transform: scale(1) translateY(0);      opacity: 1; }
}

@keyframes skeleton-sweep {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* ─── Utility Classes ─── */
.animate-aurora {
  animation: aurora 8s ease infinite;
}

.animate-shimmer-text {
  background: linear-gradient(90deg, #a78bfa 0%, #ffffff 40%, #6d28d9 60%, #a78bfa 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}

.animate-float {
  animation: dp-float 3.5s ease-in-out infinite;
}

.animate-glow-pulse {
  animation: glow-pulse 2.5s ease-in-out infinite;
}

.animate-slide-up {
  animation: slide-up 0.5s ease both;
}

.animate-spring-in {
  animation: spring-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.skeleton-loading {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% auto;
  animation: skeleton-sweep 1.5s linear infinite;
}
```

- [ ] **Step 2: Verify no CSS parse errors**

```bash
cd foliosage-frontend && npm run build 2>&1 | head -30
```

Expected: No CSS errors in the first 30 lines of build output (TypeScript errors from unimplemented pages are OK at this stage).

- [ ] **Step 3: Commit**

```bash
cd foliosage-frontend
git add app/globals.css
git commit -m "feat: add Dark Premium animation keyframes and utility CSS classes"
```

---

### Task 2: CountUpNumber Component

**Files:**
- Create: `foliosage-frontend/components/ui/CountUpNumber.tsx`

- [ ] **Step 1: Create CountUpNumber component**

Create `components/ui/CountUpNumber.tsx`:

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  target: number
  duration?: number
  className?: string
}

export default function CountUpNumber({ target, duration = 600, className }: Props) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const progress = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setValue(Math.round(progress * target))
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return <span className={className}>{value.toLocaleString()}</span>
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1 | grep CountUpNumber
```

Expected: no output (no errors related to this file).

- [ ] **Step 3: Commit**

```bash
cd foliosage-frontend
git add components/ui/CountUpNumber.tsx
git commit -m "feat: add CountUpNumber component with rAF ease-out animation"
```

---

### Task 3: ChatPanel Dark Theme

**Files:**
- Modify: `foliosage-frontend/components/ChatPanel.tsx`

- [ ] **Step 1: Update ChatPanel to accept dark prop**

Replace the entire `components/ChatPanel.tsx` with:

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import publicApi from '@/lib/publicApi'

interface Message { id: number; role: 'user' | 'assistant'; content: string }
interface Props { shareCode: string; dark?: boolean }

export default function ChatPanel({ shareCode, dark = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', content: '안녕하세요! 이 포트폴리오에 대해 무엇이든 물어보세요 👋' }
  ])
  const nextId = useRef(1)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { id: nextId.current++, role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const { data } = await publicApi.post(`/api/public/${shareCode}/chat`, {
        message: userMessage,
        conversationId,
        sessionId,
      })
      if (data.conversationId) setConversationId(data.conversationId)
      setMessages(prev => [...prev, { id: nextId.current++, role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, {
        id: nextId.current++,
        role: 'assistant',
        content: '답변을 가져오는 데 문제가 발생했습니다. 다시 시도해 주세요.',
      }])
    } finally { setLoading(false) }
  }

  if (dark) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-[#334155] flex-shrink-0">
          <p className="text-[#a78bfa] font-semibold text-sm">💬 AI 채팅</p>
          <p className="text-[#475569] text-xs">Powered by VaultSage AI</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#6d28d9] text-white rounded-br-sm'
                  : 'bg-[#1e293b] text-[#94a3b8] rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1e293b] rounded-2xl rounded-bl-sm px-4 py-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#475569] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#475569] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#475569] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-[#334155] flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-[#0f172a] border border-[#334155] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#6d28d9] placeholder:text-[#475569]"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>
    )
  }

  // Light theme (existing — unchanged)
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-600 to-pink-500">
        <p className="text-white font-semibold text-sm">💬 Ask about this portfolio</p>
        <p className="text-purple-100 text-xs">Powered by VaultSage AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a question..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1 | grep ChatPanel
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd foliosage-frontend
git add components/ChatPanel.tsx
git commit -m "feat: add dark theme variant to ChatPanel"
```

---

### Task 4: FileUploadZone Compact Variant

**Files:**
- Modify: `foliosage-frontend/components/FileUploadZone.tsx`

- [ ] **Step 1: Add compact prop to FileUploadZone**

Replace the entire `components/FileUploadZone.tsx` with:

```tsx
'use client'
import { useState, useRef } from 'react'
import api from '@/lib/api'

interface Props {
  portfolioId: string
  onUploaded: (file: any) => void
  compact?: boolean
}

export default function FileUploadZone({ portfolioId, onUploaded, compact = false }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        const { data } = await api.post(`/api/portfolios/${portfolioId}/files`, form)
        onUploaded(data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.response?.data?.error ?? 'Upload failed.')
    } finally { setUploading(false) }
  }

  if (compact) {
    return (
      <div>
        <div
          className="border border-dashed border-[#334155] rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[#6d28d9] hover:bg-[#1e0a3c]/20 transition-all"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        >
          <span className="text-xl">📁</span>
          <span className="text-[#64748b] text-sm flex-1">
            {uploading ? '업로드 중...' : '파일 추가 (클릭 또는 드래그)'}
          </span>
          <span className="text-[#6d28d9] text-xs font-medium">+ 추가</span>
          <input ref={fileRef} type="file" multiple className="hidden"
                 onChange={e => handleFiles(e.target.files)} />
        </div>
        {error && <p className="text-[#f87171] text-xs mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <div className="text-4xl mb-3">📁</div>
        {uploading
          ? <p className="text-purple-600 font-medium">Uploading...</p>
          : <p className="text-slate-500">Drop files here or click to upload<br /><span className="text-sm">Any file type supported</span></p>
        }
        <input ref={fileRef} type="file" multiple className="hidden"
               onChange={e => handleFiles(e.target.files)} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1 | grep FileUploadZone
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd foliosage-frontend
git add components/FileUploadZone.tsx
git commit -m "feat: add compact variant to FileUploadZone"
```

---

### Task 5: Share Link Page Redesign

**Files:**
- Modify: `foliosage-frontend/app/p/[shareCode]/page.tsx`
- Create: `foliosage-frontend/app/p/[shareCode]/ShareLinkClient.tsx`

- [ ] **Step 1: Create ShareLinkClient.tsx**

Create `app/p/[shareCode]/ShareLinkClient.tsx`:

```tsx
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
```

- [ ] **Step 2: Replace app/p/[shareCode]/page.tsx with server component wrapper**

Replace the entire contents of `app/p/[shareCode]/page.tsx` with:

```tsx
import type { Metadata } from 'next'
import ShareLinkClient from './ShareLinkClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareCode: string }>
}): Promise<Metadata> {
  const { shareCode } = await params
  try {
    const res = await fetch(`${API_URL}/api/public/${shareCode}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return {}
    const data = await res.json()
    const firstFile = data.files?.[0]
    const imageUrl = firstFile
      ? `${API_URL}/api/public/${shareCode}/preview/${firstFile.vaultsageFileId}`
      : undefined
    const title = `${data.title} — FolioSage`
    const description = data.description ?? `${data.ownerName ?? '포트폴리오'} on FolioSage`
    return {
      title,
      description,
      openGraph: {
        title: data.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      twitter: { card: 'summary_large_image' },
    }
  } catch {
    return {}
  }
}

export default async function ShareLinkPage({
  params,
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params
  return <ShareLinkClient shareCode={shareCode} />
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1 | grep -E "ShareLink|p/\[shareCode\]"
```

Expected: no output.

- [ ] **Step 4: Start dev server and manually verify**

```bash
cd foliosage-frontend && npm run dev &
# Wait ~5s for server to start, then open in browser:
# http://localhost:3000/p/<any-real-shareCode>
```

Verify:
- Page has dark background (`#0f172a`)
- Top bar shows FolioSage wordmark + portfolio title
- PDFs render inside `<iframe>` (full scroll support)
- Images render in the center area
- `↓ 다운로드` button triggers file download
- `💬 AI 채팅` button slides in the chat panel from the right with spring animation
- Bottom strip shows file chips; selected chip glows purple
- Skeleton loading appears before data loads

Kill dev server: `kill %1`

- [ ] **Step 5: Commit**

```bash
cd foliosage-frontend
git add app/p/[shareCode]/page.tsx app/p/[shareCode]/ShareLinkClient.tsx
git commit -m "feat: share link page — dark premium redesign, PDF iframe, chat spring slide, OG meta"
```

---

### Task 6: Portfolio Management Page Redesign

**Files:**
- Modify: `foliosage-frontend/app/portfolios/[id]/page.tsx`

- [ ] **Step 1: Replace the entire portfolio management page**

Replace the entire contents of `app/portfolios/[id]/page.tsx` with:

```tsx
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
                      value={editingDesc.value}
                      onChange={e => setEditingDesc({ id: file.id, value: e.target.value })}
                      onBlur={() => saveDescription(file.id, editingDesc.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveDescription(file.id, editingDesc.value)
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
```

- [ ] **Step 2: TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1 | grep -E "portfolios/\[id\]"
```

Expected: no output.

- [ ] **Step 3: Start dev server and manually verify**

```bash
cd foliosage-frontend && npm run dev &
# Open: http://localhost:3000/portfolios/<any-real-portfolio-id>
```

Verify:
- Dark layout: sidebar on left (220px), main content on right
- Sidebar shows portfolio title, status badge (green "공개 중" or grey "비공개")
- Stats section shows 3 count-up boxes (총 조회, 오늘, 다운)
- AI organize section shows current status + category tree if done + Start button
- Quick links section shows copy button and external view link
- Main area: compact upload zone at top, then 2-column file grid
- Each file card shows emoji icon + filename + description edit (click to edit, blur/Enter to save, Escape to cancel)
- Delete button appears on hover (top-right); clicking opens confirm modal with spring animation
- Confirm modal shows, clicking 삭제 removes the file

Kill dev server: `kill %1`

- [ ] **Step 4: Commit**

```bash
cd foliosage-frontend
git add app/portfolios/[id]/page.tsx
git commit -m "feat: portfolio management page — dark sidebar+grid, file delete, inline description edit, stats"
```

---

### Task 7: User Profile Page

**Files:**
- Create: `foliosage-frontend/app/u/[username]/page.tsx`
- Create: `foliosage-frontend/app/u/[username]/ProfileClient.tsx`

- [ ] **Step 1: Create ProfileClient.tsx**

Create `app/u/[username]/ProfileClient.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import CountUpNumber from '@/components/ui/CountUpNumber'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

type PortfolioSummary = {
  id: string
  title: string
  description: string | null
  shareCode: string
  viewCount: number
  fileCount: number
}

type UserProfile = {
  username: string
  name: string
  bio: string | null
  location: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  totalViews: number
  portfolios: PortfolioSummary[]
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/public/users/${username}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(setProfile)
      .catch(() => setError('사용자를 찾을 수 없습니다.'))
  }, [username])

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-[#94a3b8]">{error}</p>
          <Link href="/" className="text-[#a78bfa] text-sm mt-4 inline-block hover:underline">
            FolioSage 홈으로 →
          </Link>
        </div>
      </div>
    )
  }

  const particles = [
    { size: 5, color: '#6d28d9', top: '20%', left: '12%',  delay: '0s',   dur: '3.5s' },
    { size: 3, color: '#4f46e5', top: '55%', right: '16%', delay: '0.8s', dur: '4.2s' },
    { size: 4, color: '#a78bfa', top: '75%', left: '35%',  delay: '0.3s', dur: '3s',  opacity: 0.6 },
    { size: 3, color: '#818cf8', top: '30%', right: '32%', delay: '1.2s', dur: '5s'  },
    { size: 6, color: '#6d28d9', bottom: '12%', right: '8%', delay: '0.5s', dur: '3.8s', opacity: 0.4 },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a]">

      {/* ── Nav ── */}
      <div className="bg-[#0a0f1e] border-b border-[#1e293b] px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-[#a78bfa] font-bold text-sm tracking-widest">FolioSage</Link>
        <Link href="/login"
          className="bg-[#1e293b] border border-[#334155] text-[#64748b] text-xs px-3 py-1.5 rounded-lg hover:border-[#6d28d9] transition-colors">
          로그인 / 가입
        </Link>
      </div>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-8 pt-12 pb-10">
        {/* Aurora bg */}
        <div
          className="absolute inset-0 animate-aurora"
          style={{ background: 'linear-gradient(135deg, #1e0a3c, #0f172a, #0d2137, #150d2e, #1e0a3c)', backgroundSize: '400% 400%' }}
        />

        {/* Particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none animate-float"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              top: (p as any).top,
              bottom: (p as any).bottom,
              left: (p as any).left,
              right: (p as any).right,
              opacity: (p as any).opacity ?? 0.7,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}

        <div className="relative z-10 max-w-[760px] mx-auto">
          {profile ? (
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar with glow */}
              <div
                className="w-16 h-16 rounded-[18px] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 animate-glow-pulse"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}
              >
                {getInitials(profile.name)}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold animate-shimmer-text">{profile.name}</h1>
                <p className="text-[#a78bfa] text-sm mt-1">
                  @{profile.username}
                  {profile.location && (
                    <span className="text-[#64748b] ml-2">· {profile.location}</span>
                  )}
                </p>
                {profile.bio && (
                  <p className="text-[#64748b] text-sm mt-3 leading-relaxed max-w-md">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[rgba(30,41,59,0.8)] backdrop-blur-sm border border-[#334155] text-[#94a3b8] text-xs px-3 py-1.5 rounded-full hover:border-[#6d28d9] hover:text-white transition-all"
                    >
                      🔗 링크드인
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[rgba(30,41,59,0.8)] backdrop-blur-sm border border-[#334155] text-[#94a3b8] text-xs px-3 py-1.5 rounded-full hover:border-[#6d28d9] hover:text-white transition-all"
                    >
                      🐙 깃허브
                    </a>
                  )}
                </div>
              </div>

              {/* Stats boxes */}
              <div className="flex gap-3 flex-shrink-0">
                <div className="animate-slide-up bg-[rgba(30,41,59,0.6)] backdrop-blur-sm border border-[#334155] rounded-xl px-4 py-3 text-center">
                  <CountUpNumber
                    target={profile.portfolios.length}
                    className="text-[#a78bfa] text-xl font-bold block"
                  />
                  <p className="text-[#475569] text-[10px] mt-0.5">포트폴리오</p>
                </div>
                <div
                  className="animate-slide-up bg-[rgba(30,41,59,0.6)] backdrop-blur-sm border border-[#334155] rounded-xl px-4 py-3 text-center"
                  style={{ animationDelay: '0.1s' }}
                >
                  <CountUpNumber
                    target={profile.totalViews}
                    className="text-[#34d399] text-xl font-bold block"
                  />
                  <p className="text-[#475569] text-[10px] mt-0.5">총 조회</p>
                </div>
              </div>
            </div>
          ) : (
            /* Skeleton */
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 skeleton-loading rounded-[18px] flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-6 w-44 skeleton-loading rounded" />
                <div className="h-3 w-28 skeleton-loading rounded" />
                <div className="h-3 w-80 skeleton-loading rounded mt-3" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Portfolio grid ── */}
      <div className="max-w-[760px] mx-auto px-8 py-8">
        <p className="text-[#475569] text-xs font-bold uppercase tracking-widest mb-4">
          공개 포트폴리오
        </p>

        {profile ? (
          profile.portfolios.length === 0 ? (
            <p className="text-[#475569] text-center py-14 text-sm">공개된 포트폴리오가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.portfolios.map((p, i) => (
                <Link key={p.id} href={`/p/${p.shareCode}`}>
                  <div
                    className="group bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden cursor-pointer animate-slide-up hover:border-[#6d28d9] hover:shadow-[0_8px_32px_rgba(109,40,217,0.25)] transition-all"
                    style={{
                      transitionDuration: '0.3s',
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    {/* Preview area */}
                    <div className="h-24 relative overflow-hidden flex items-center justify-center">
                      <div
                        className="absolute inset-0 animate-aurora opacity-70"
                        style={{
                          background: 'linear-gradient(135deg, #2d0a5c, #0f172a, #1e0a3c)',
                          backgroundSize: '300% 300%',
                        }}
                      />
                      <div className="relative z-10 flex gap-2 items-end">
                        {Array.from({ length: Math.min(p.fileCount, 3) }).map((_, j) => (
                          <div
                            key={j}
                            className="bg-white/10 rounded flex items-center justify-center text-base"
                            style={{ width: 34, height: 44 - j * 5 }}
                          >
                            📄
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-2 right-2.5 bg-[rgba(109,40,217,0.85)] text-white text-[9px] px-2 py-0.5 rounded-full">
                        {p.fileCount}개 파일
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-white font-semibold text-sm group-hover:text-[#a78bfa] transition-colors">
                        {p.title}
                      </p>
                      {p.description && (
                        <p className="text-[#475569] text-xs mt-1 truncate">{p.description}</p>
                      )}
                      <div className="flex justify-end mt-2">
                        <span className="text-[#475569] text-xs">👁 {p.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map(i => (
              <div key={i} className="h-44 skeleton-loading rounded-2xl" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center mt-12 pt-6 border-t border-[#1e293b]">
          <p className="text-[#334155] text-xs">
            <Link href="/signup" className="animate-shimmer-text font-bold">FolioSage</Link>
            <span className="ml-1 text-[#334155]">로 나만의 포트폴리오 만들기 →</span>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create app/u/[username]/page.tsx**

Create `app/u/[username]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  try {
    const res = await fetch(`${API_URL}/api/public/users/${username}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return {}
    const data = await res.json()
    const title = `${data.name} (@${data.username}) — FolioSage`
    const description = data.bio ?? `${data.name}의 포트폴리오`
    return {
      title,
      description,
      openGraph: { title, description },
      twitter: { card: 'summary' },
    }
  } catch {
    return {}
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  return <ProfileClient username={username} />
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1 | grep -E "u/\[username\]|ProfileClient"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd foliosage-frontend
git add app/u/[username]/page.tsx app/u/[username]/ProfileClient.tsx
git commit -m "feat: public user profile page /u/[username] with aurora hero, portfolio grid, OG meta"
```

---

### Task 8: Dashboard Profile Edit Section

**Files:**
- Modify: `foliosage-frontend/app/dashboard/page.tsx`

- [ ] **Step 1: Replace the entire dashboard page**

Replace the entire contents of `app/dashboard/page.tsx` with:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, removeToken } from '@/lib/auth'
import api from '@/lib/api'

type Portfolio = {
  id: string
  title: string
  published: boolean
  fileCount: number
  createdAt: string
}

type Profile = {
  name: string
  username: string | null
  bio: string | null
  location: string | null
  linkedinUrl: string | null
  githubUrl: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileForm, setProfileForm] = useState<Profile>({
    name: '', username: null, bio: null, location: null, linkedinUrl: null, githubUrl: null,
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [tab, setTab] = useState<'portfolios' | 'profile'>('portfolios')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    api.get('/api/portfolios')
      .then(r => setPortfolios(r.data))
      .catch(() => setError('포트폴리오를 불러오지 못했습니다.'))
    api.get('/api/users/me')
      .then(r => {
        setProfile(r.data)
        setProfileForm(r.data)
      })
      .catch(() => { /* profile optional */ })
  }, [router])

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileError('')
    try {
      await api.patch('/api/users/me/profile', {
        username: profileForm.username || null,
        bio: profileForm.bio || null,
        location: profileForm.location || null,
        linkedinUrl: profileForm.linkedinUrl || null,
        githubUrl: profileForm.githubUrl || null,
      })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
      api.get('/api/users/me').then(r => setProfile(r.data))
    } catch (e: any) {
      setProfileError(e?.response?.data?.message ?? '저장 실패')
    } finally {
      setProfileSaving(false)
    }
  }

  const field = (
    label: string,
    key: keyof Profile,
    placeholder: string,
    type = 'text',
  ) => (
    <div>
      <label className="block text-[#94a3b8] text-xs font-medium mb-1">{label}</label>
      <input
        type={type}
        value={profileForm[key] ?? ''}
        onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value || null }))}
        placeholder={placeholder}
        className="w-full bg-[#0f172a] border border-[#334155] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#6d28d9] placeholder:text-[#334155]"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 bg-[#080e1a] border-b border-[#1e293b]">
        <span className="text-[#a78bfa] font-bold tracking-widest">FolioSage</span>
        <div className="flex gap-2">
          {profile?.username && (
            <Link
              href={`/u/${profile.username}`}
              className="text-[#94a3b8] text-xs px-3 py-1.5 rounded-lg hover:bg-[#1e293b] hover:text-white transition-colors"
            >
              내 프로필 →
            </Link>
          )}
          <Link href="/portfolios/new"
            className="bg-[#6d28d9] hover:bg-[#7c3aed] text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
            + 새 포트폴리오
          </Link>
          <button
            onClick={() => { removeToken(); router.push('/login') }}
            className="text-[#64748b] text-xs px-3 py-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            로그아웃
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0d1020] border border-[#1e293b] rounded-xl p-1 w-fit">
          {(['portfolios', 'profile'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              {t === 'portfolios' ? '📂 포트폴리오' : '👤 프로필'}
            </button>
          ))}
        </div>

        {/* Portfolios tab */}
        {tab === 'portfolios' && (
          <div>
            {error && <p className="text-[#f87171] text-sm mb-4">{error}</p>}
            {portfolios.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🎨</p>
                <p className="text-[#475569] mb-4">포트폴리오가 없습니다.</p>
                <Link href="/portfolios/new"
                  className="bg-[#6d28d9] hover:bg-[#7c3aed] text-white text-sm px-5 py-2.5 rounded-lg inline-block transition-colors">
                  첫 포트폴리오 만들기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolios.map((p, i) => (
                  <Link key={p.id} href={`/portfolios/${p.id}`}>
                    <div
                      className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 hover:border-[#6d28d9] hover:shadow-[0_4px_24px_rgba(109,40,217,0.2)] transition-all cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                        <div className={`text-[10px] px-2 py-0.5 rounded-full ${
                          p.published ? 'bg-[#064e3b] text-[#34d399]' : 'bg-[#1e293b] border border-[#334155] text-[#64748b]'
                        }`}>
                          {p.published ? '공개' : '비공개'}
                        </div>
                      </div>
                      <p className="text-[#475569] text-xs">{p.fileCount}개 파일</p>
                      <p className="text-[#334155] text-xs mt-1">
                        {new Date(p.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="max-w-lg">
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 space-y-4">
              <h2 className="text-white font-semibold mb-2">프로필 편집</h2>

              {field('사용자명 (username)', 'username', 'minjoonsage (영문, 숫자, -, _)')}
              {field('한 줄 소개 (bio)', 'bio', '나를 소개하는 한 줄을 적어보세요')}
              {field('위치', 'location', '서울, 대한민국')}
              {field('링크드인 URL', 'linkedinUrl', 'https://linkedin.com/in/username', 'url')}
              {field('깃허브 URL', 'githubUrl', 'https://github.com/username', 'url')}

              {profileError && <p className="text-[#f87171] text-xs">{profileError}</p>}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  className="bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm px-5 py-2 rounded-lg transition-colors"
                >
                  {profileSaving ? '저장 중...' : '저장'}
                </button>
                {profileSaved && <span className="text-[#34d399] text-sm">✅ 저장됨</span>}
                {profile?.username && (
                  <Link
                    href={`/u/${profile.username}`}
                    target="_blank"
                    className="text-[#a78bfa] text-xs hover:underline ml-auto"
                  >
                    내 프로필 보기 ↗
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1 | grep dashboard
```

Expected: no output.

- [ ] **Step 3: Start dev server and manually verify**

```bash
cd foliosage-frontend && npm run dev &
# Open: http://localhost:3000/dashboard (must be logged in)
```

Verify:
- Nav shows "내 프로필 →" link if username is set
- "포트폴리오" tab shows portfolio cards with dark theme + slide-up animation
- "프로필" tab shows edit form with all fields
- Saving shows "저장 중..." then "✅ 저장됨"
- If username is set, "내 프로필 보기 ↗" link appears

Kill dev server: `kill %1`

- [ ] **Step 4: Commit**

```bash
cd foliosage-frontend
git add app/dashboard/page.tsx
git commit -m "feat: dashboard dark redesign, profile edit tab (username/bio/location/social links)"
```

---

### Task 9: Final Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Full TypeScript check**

```bash
cd foliosage-frontend && npx tsc --noEmit 2>&1
```

Expected: no errors (or only pre-existing errors unrelated to this plan).

- [ ] **Step 2: Production build**

```bash
cd foliosage-frontend && npm run build 2>&1
```

Expected: `✓ Compiled successfully` (or equivalent). Note any new errors and fix them before proceeding.

**Common fix — if you see "params should be awaited":**

In Next.js 16+, `params` is a Promise. Any page component accessing `params` directly (e.g., `params.shareCode` without await) will error. Both `page.tsx` files in this plan already use `await params` correctly.

**Common fix — if you see "use client" / "generateMetadata" conflict:**

`generateMetadata` can only exist in Server Components. If the file has `'use client'` at the top AND exports `generateMetadata`, remove `'use client'` — it must be a server component wrapper. The client logic lives in the `*Client.tsx` file.

- [ ] **Step 3: Start production server and smoke-test key user flows**

```bash
cd foliosage-frontend && npm run build && npm run start &
sleep 3

# Test 1: Share link page (dark, PDF viewer, chat toggle, download)
# Open: http://localhost:3000/p/<real-shareCode>

# Test 2: Portfolio management (sidebar, delete, description edit)
# Open: http://localhost:3000/portfolios/<real-id>  (must be logged in)

# Test 3: Profile page (aurora hero, portfolio grid)
# Open: http://localhost:3000/u/<username>  (must have set username via dashboard)

# Test 4: Dashboard profile tab
# Open: http://localhost:3000/dashboard → click 프로필 tab

kill %1
```

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
cd foliosage-frontend
git add -A
git commit -m "fix: production build fixes"
# Only commit if there were actual changes
```

---

## Self-Review

### Spec coverage

| Spec section | Covered by task |
|---|---|
| Animation system (aurora, shimmer, particles, glow, spring, slide-up, skeleton, count-up) | Task 1, 2 + used in Tasks 5–8 |
| Share link — fullscreen PDF/image viewer | Task 5 (ShareLinkClient iframe + rawUrl) |
| Share link — slide-in AI chat (spring) | Task 5 (transform translateX with cubic-bezier) |
| Share link — bottom file strip with glow | Task 5 (bottom div with file chips) |
| Share link — download button | Task 5 (handleDownload, `/raw?download=true`) |
| Share link — view count badge | Task 5 (CountUpNumber with portfolio.viewCount) |
| Share link — OG meta tags | Task 5 (generateMetadata in page.tsx) |
| Portfolio mgmt — sidebar (stats, AI, links) | Task 6 |
| Portfolio mgmt — 2-col file grid | Task 6 |
| Portfolio mgmt — file deletion with confirm | Task 6 (deleteFile + modal) |
| Portfolio mgmt — inline description edit | Task 6 (editingDesc state + input) |
| Portfolio mgmt — stats (총 조회, 오늘, 다운) | Task 6 (GET /api/portfolios/{id}/stats) |
| Profile page — aurora hero + particles | Task 7 |
| Profile page — shimmer name + glow avatar | Task 7 |
| Profile page — portfolio grid with spring hover | Task 7 |
| Profile page — OG meta tags | Task 7 (generateMetadata) |
| Dashboard — profile edit (username, bio, etc.) | Task 8 |
| Dashboard — link to own profile | Task 8 (nav "내 프로필 →") |
| Dark chat panel (used in share link) | Task 3 (dark prop on ChatPanel) |
| FileUploadZone compact (used in mgmt page) | Task 4 |

### Type consistency

- `FileItem.vaultsageFileId` (string) used in `rawUrl()` — matches backend `PortfolioFile.vaultsageFileId`
- `Portfolio.viewCount` (number) used in `CountUpNumber` target — matches backend `Portfolio.viewCount` added in V3 migration
- `StatsResponse` shape `{ viewCount, downloadCount, todayViews }` matches backend `StatsService.getStats()` return
- `UserProfile.portfolios[].shareCode` used in `/p/${shareCode}` links — matches backend `PublicUserResponse.PortfolioSummary.shareCode`
- `generateMetadata` uses `await params` in both server wrappers — required by Next.js 16

### Placeholder scan

No TBDs, TODOs, or "similar to above" references found. All steps contain runnable code or explicit shell commands.
