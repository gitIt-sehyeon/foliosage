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
