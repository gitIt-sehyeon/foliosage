'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Copy,
  Eye,
  FileStack,
  FileText,
  LinkIcon,
  MapPin,
  ShieldCheck,
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
  defenseCompleted: boolean
  defenseOverallScore: number | null
  defenseSummary: string | null
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
  const [copiedProfile, setCopiedProfile] = useState(false)
  const [copiedPortfolio, setCopiedPortfolio] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/public/users/${username}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(setProfile)
      .catch(() => setError('User not found.'))
  }, [username])

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : ''

  const copyProfileLink = async () => {
    if (!profileUrl) return
    await navigator.clipboard.writeText(profileUrl)
    setCopiedProfile(true)
    setTimeout(() => setCopiedProfile(false), 1500)
  }

  const copyPortfolioLink = async (shareCode: string, id: string) => {
    if (typeof window === 'undefined') return
    await navigator.clipboard.writeText(`${window.location.origin}/p/${shareCode}`)
    setCopiedPortfolio(id)
    setTimeout(() => setCopiedPortfolio(null), 1500)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="text-center">
          <UserRound className="mx-auto mb-4 size-12 text-[#475569]" />
          <p className="text-[#94a3b8]">{error}</p>
          <Link href="/" className="text-[#a78bfa] text-sm mt-4 inline-block hover:underline">
            Back to FolioSage →
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
          Log in / Sign up
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
                      <button
                        onClick={copyProfileLink}
                        className="inline-flex items-center gap-1.5 bg-white/[0.035] backdrop-blur-sm border border-white/10 text-[#94a3b8] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.07] hover:text-white transition-all"
                      >
                        {copiedProfile ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copiedProfile ? 'Copied' : 'Profile link'}
                      </button>
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/[0.035] backdrop-blur-sm border border-white/10 text-[#94a3b8] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.07] hover:text-white transition-all"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <LinkIcon className="size-3.5" />
                            LinkedIn
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
                            GitHub
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
                    <p className="text-[#64748b] text-xs mt-1">Portfolios</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <Eye className="mb-6 size-5 text-emerald-200" />
                    <CountUpNumber
                      target={profile.totalViews}
                      className="text-3xl font-semibold text-white block"
                    />
                    <p className="text-[#64748b] text-xs mt-1">Total views</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-sm font-medium text-white">Shareable creator card</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Share public portfolios, evidence files, and AI review results in one place.
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
          Public portfolios
        </p>

        {profile ? (
          profile.portfolios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1020]/70 text-center py-16">
              <BriefcaseBusiness className="mx-auto mb-3 size-10 text-[#475569]" />
              <p className="text-[#64748b] text-sm">No public portfolios yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.portfolios.map((p, i) => (
                <article key={p.id}
                  className="group min-h-[244px] bg-[#0b1020]/90 border border-white/10 rounded-2xl overflow-hidden animate-slide-up hover:border-[#6d28d9]/70 hover:bg-[#111827] hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition-all"
                  style={{
                    transitionDuration: '0.3s',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animationDelay: `${i * 0.12}s`,
                  }}
                >
                  <Link href={`/p/${p.shareCode}`} className="block">
                    <div className="relative flex min-h-[104px] items-center gap-4 border-b border-white/10 p-5">
                      <div
                        className="absolute inset-0 animate-aurora opacity-35"
                        style={{
                          background: 'linear-gradient(135deg, #1e0a3c, #0b1020, #0d2137, #1e0a3c)',
                          backgroundSize: '300% 300%',
                        }}
                      />
                      <div className="relative z-10 flex size-14 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                        <FileStack className="size-6 text-white/75" />
                      </div>
                      <div className="relative z-10 min-w-0 flex-1">
                        <p className="line-clamp-2 text-base font-semibold text-white group-hover:text-violet-100 transition-colors">
                          {p.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <FileText className="size-3.5" />
                            {p.fileCount} files
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="size-3.5" />
                            {p.viewCount}
                          </span>
                          {p.defenseCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-2 py-0.5 text-emerald-200">
                              <ShieldCheck className="size-3" />
                              AI Review {p.defenseOverallScore ?? 'Complete'}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="relative z-10 size-4 text-violet-200 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>

                  <div
                    className="p-5"
                  >
                    {p.description ? (
                      <p className="text-[#64748b] text-sm leading-6 line-clamp-2">{p.description}</p>
                    ) : (
                      <p className="text-[#475569] text-sm">This public portfolio has no description.</p>
                    )}
                    {p.defenseSummary && (
                      <p className="mt-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.045] px-3 py-2 text-xs leading-5 text-emerald-100 line-clamp-2">
                        {p.defenseSummary}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/p/${p.shareCode}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-400"
                      >
                        View
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => copyPortfolioLink(p.shareCode, p.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-300 transition-colors hover:text-white"
                      >
                        {copiedPortfolio === p.id ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copiedPortfolio === p.id ? 'Copied' : 'Copy link'}
                      </button>
                    </div>
                  </div>
                </article>
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
            <span className="ml-1">to create your own portfolio</span>
          </p>
        </div>
      </section>
      </main>
    </div>
  )
}
