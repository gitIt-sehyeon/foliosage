'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Eye,
  FileStack,
  FileText,
  LinkIcon,
  MapPin,
  Sparkles,
  UserRound,
} from 'lucide-react'
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
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="text-center">
          <UserRound className="mx-auto mb-4 size-12 text-[#475569]" />
          <p className="text-[#94a3b8]">{error}</p>
          <Link href="/" className="text-[#a78bfa] text-sm mt-4 inline-block hover:underline">
            FolioSage 홈으로 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(124,58,237,0.20),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(20,184,166,0.12),transparent_25%),radial-gradient(circle_at_54%_88%,rgba(245,158,11,0.08),transparent_24%)]" />

      {/* ── Nav ── */}
      <div className="relative z-10 px-5 py-5 flex justify-between items-center sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
        </Link>
        <Link href="/login"
          className="bg-white/[0.035] border border-white/10 text-[#94a3b8] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.07] hover:text-white transition-colors">
          로그인 / 가입
        </Link>
      </div>

      {/* ── Hero ── */}
      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_360px]">
          {profile ? (
            <>
              <div className="animate-slide-up rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">Creator profile</p>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-3xl font-semibold text-violet-100 shadow-[0_0_34px_rgba(124,58,237,0.20)]">
                    {getInitials(profile.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">{profile.name}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="text-violet-200">@{profile.username}</span>
                      {profile.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {profile.location}
                        </span>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">{profile.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-5">
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/[0.035] backdrop-blur-sm border border-white/10 text-[#94a3b8] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.07] hover:text-white transition-all"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <LinkIcon className="size-3.5" />
                            링크드인
                          </span>
                        </a>
                      )}
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/[0.035] backdrop-blur-sm border border-white/10 text-[#94a3b8] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.07] hover:text-white transition-all"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <LinkIcon className="size-3.5" />
                            깃허브
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="animate-slide-up rounded-2xl border border-white/10 bg-[#0b1020]/80 p-5 backdrop-blur-xl" style={{ animationDelay: '0.08s' }}>
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Public stats</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <BriefcaseBusiness className="mb-6 size-5 text-violet-200" />
                    <CountUpNumber
                      target={profile.portfolios.length}
                      className="text-3xl font-semibold text-white block"
                    />
                    <p className="text-[#64748b] text-xs mt-1">포트폴리오</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <Eye className="mb-6 size-5 text-emerald-200" />
                    <CountUpNumber
                      target={profile.totalViews}
                      className="text-3xl font-semibold text-white block"
                    />
                    <p className="text-[#64748b] text-xs mt-1">총 조회</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-sm font-medium text-white">Verified portfolio space</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Published work from FolioSage portfolios with file context and AI-ready public pages.
                  </p>
                </div>
              </aside>
            </>
          ) : (
            /* Skeleton */
            <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 skeleton-loading rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-8 w-56 skeleton-loading rounded" />
                  <div className="h-3 w-28 skeleton-loading rounded" />
                  <div className="h-3 w-80 skeleton-loading rounded mt-3" />
                </div>
              </div>
            </div>
          )}
        </section>

      {/* ── Portfolio grid ── */}
      <section>
        <p className="text-[#64748b] text-xs font-bold uppercase tracking-[0.24em] mb-4">
          공개 포트폴리오
        </p>

        {profile ? (
          profile.portfolios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1020]/70 text-center py-16">
              <BriefcaseBusiness className="mx-auto mb-3 size-10 text-[#475569]" />
              <p className="text-[#64748b] text-sm">공개된 포트폴리오가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {profile.portfolios.map((p, i) => (
                <Link key={p.id} href={`/p/${p.shareCode}`}>
                  <div
                    className="group min-h-[240px] bg-[#0b1020]/90 border border-white/10 rounded-2xl overflow-hidden cursor-pointer animate-slide-up hover:border-[#6d28d9]/70 hover:bg-[#111827] hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition-all"
                    style={{
                      transitionDuration: '0.3s',
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    {/* Preview area */}
                    <div className="h-32 relative overflow-hidden flex items-center justify-center border-b border-white/10">
                      <div
                        className="absolute inset-0 animate-aurora opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #1e0a3c, #0b1020, #0d2137, #1e0a3c)',
                          backgroundSize: '300% 300%',
                        }}
                      />
                      <div className="relative z-10 flex gap-2.5 items-end">
                        {Array.from({ length: Math.min(p.fileCount, 3) }).map((_, j) => (
                          <div
                            key={j}
                            className="bg-white/10 border border-white/10 rounded-lg flex items-center justify-center"
                            style={{ width: 42, height: 58 - j * 7 }}
                          >
                            <FileText className="size-5 text-white/65" />
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#070b15]/80 border border-white/10 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xl">
                        {p.fileCount}개 파일
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="line-clamp-2 text-white font-semibold text-base group-hover:text-violet-100 transition-colors">
                        {p.title}
                      </p>
                      {p.description && (
                        <p className="text-[#64748b] text-sm mt-2 line-clamp-2">{p.description}</p>
                      )}
                      <div className="mt-5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[#475569] text-xs">
                          <Eye className="size-3.5" />
                          {p.viewCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-violet-200 opacity-0 transition-opacity group-hover:opacity-100">
                          보기
                          <ArrowUpRight className="size-3.5" />
                        </span>
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
        <div className="text-center mt-12 pt-6 border-t border-white/10">
          <p className="text-[#475569] text-xs">
            <Link href="/signup" className="font-bold text-violet-200 hover:text-white">FolioSage</Link>
            <span className="ml-1">로 나만의 포트폴리오 만들기</span>
          </p>
        </div>
      </section>
      </main>
    </div>
  )
}
