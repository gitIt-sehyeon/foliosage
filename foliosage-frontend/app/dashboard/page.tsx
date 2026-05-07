'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileStack,
  Globe2,
  LinkIcon,
  LogOut,
  MapPin,
  Palette,
  Plus,
  Sparkles,
  UserRound,
} from 'lucide-react'
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
      <label className="block text-[#94a3b8] text-xs font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={profileForm[key] ?? ''}
        onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value || null }))}
        placeholder={placeholder}
        className="w-full bg-white/[0.035] border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[#6d28d9] placeholder:text-[#475569]"
      />
    </div>
  )

  const publishedCount = portfolios.filter(p => p.published).length
  const totalFiles = portfolios.reduce((sum, p) => sum + (p.fileCount ?? 0), 0)
  const latestPortfolio = portfolios
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(124,58,237,0.20),transparent_28%),radial-gradient(circle_at_84%_22%,rgba(20,184,166,0.12),transparent_26%),radial-gradient(circle_at_56%_90%,rgba(245,158,11,0.08),transparent_24%)]" />

      <nav className="relative z-10 flex justify-between items-center px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
        </Link>
        <div className="flex gap-2">
          {profile?.username && (
            <Link
              href={`/u/${profile.username}`}
              className="hidden items-center gap-2 text-[#94a3b8] text-xs px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white transition-colors sm:inline-flex"
            >
              <ExternalLink className="size-3.5" />
              내 프로필
            </Link>
          )}
          <Link href="/portfolios/new"
            className="inline-flex items-center gap-2 bg-white hover:bg-cyan-100 text-slate-950 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <Plus className="size-3.5" />
            새 포트폴리오
          </Link>
          <button
            onClick={() => { removeToken(); router.push('/login') }}
            className="inline-flex items-center gap-2 text-[#64748b] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            <LogOut className="size-3.5" />
            로그아웃
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-5 pb-14 pt-8 sm:px-8">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="animate-slide-up rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">Workspace overview</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  {profile?.name ? `${profile.name}의 포트폴리오` : 'Portfolio workspace'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  업로드한 작업물을 정리하고, 공개 포트폴리오와 AI 응답 경험을 관리하세요.
                </p>
              </div>
              <Link href="/portfolios/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-400">
                <Plus className="size-4" />
                새 포트폴리오 만들기
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { label: '포트폴리오', value: portfolios.length, icon: BriefcaseBusiness, color: 'text-violet-200' },
                { label: '공개 중', value: publishedCount, icon: Globe2, color: 'text-emerald-200' },
                { label: '파일', value: totalFiles, icon: FileStack, color: 'text-cyan-200' },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <item.icon className={`mb-5 size-5 ${item.color}`} />
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="animate-slide-up rounded-2xl border border-white/10 bg-[#0b1020]/80 p-5 backdrop-blur-xl" style={{ animationDelay: '0.08s' }}>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Status</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
                    <UserRound className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{profile?.username ? `@${profile.username}` : '프로필 미설정'}</p>
                    <p className="text-xs text-slate-500">{profile?.bio || '공개 프로필에 소개를 추가하세요.'}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays className="size-3.5" />
                  최근 작업
                </div>
                <p className="truncate text-sm font-medium text-slate-200">
                  {latestPortfolio ? latestPortfolio.title : '아직 포트폴리오가 없습니다.'}
                </p>
                {latestPortfolio && (
                  <p className="mt-1 text-xs text-slate-600">
                    {new Date(latestPortfolio.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0b1020]/90 border border-white/10 rounded-xl p-1 w-fit backdrop-blur-xl">
          {(['portfolios', 'profile'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white/[0.08] text-white' : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {t === 'portfolios' ? <BriefcaseBusiness className="size-4" /> : <UserRound className="size-4" />}
                {t === 'portfolios' ? '포트폴리오' : '프로필'}
              </span>
            </button>
          ))}
        </div>

        {/* Portfolios tab */}
        {tab === 'portfolios' && (
          <div>
            {error && <p className="text-[#f87171] text-sm mb-4">{error}</p>}
            {portfolios.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1020]/70 text-center py-20">
                <Palette className="mx-auto mb-4 size-10 text-[#475569]" />
                <p className="text-slate-300 font-medium mb-2">포트폴리오가 없습니다.</p>
                <p className="text-[#64748b] text-sm mb-5">첫 작업 공간을 만들고 파일을 업로드하세요.</p>
                <Link href="/portfolios/new"
                  className="inline-flex items-center gap-2 bg-white hover:bg-cyan-100 text-slate-950 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  <Plus className="size-4" />
                  첫 포트폴리오 만들기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {portfolios.map((p, i) => (
                  <Link key={p.id} href={`/portfolios/${p.id}`}>
                    <div
                      className="group min-h-[188px] bg-[#0b1020]/90 border border-white/10 rounded-2xl p-5 hover:border-[#6d28d9]/70 hover:bg-[#111827] hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition-all cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <span className="flex size-11 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.07] text-violet-200">
                          <BriefcaseBusiness className="size-5" />
                        </span>
                        <div className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full ${
                          p.published ? 'bg-[#064e3b] text-[#34d399]' : 'bg-white/[0.035] border border-white/10 text-[#64748b]'
                        }`}>
                          <span className={`size-1.5 rounded-full ${p.published ? 'bg-[#34d399]' : 'bg-[#64748b]'}`} />
                          {p.published ? '공개' : '비공개'}
                        </div>
                      </div>
                      <h3 className="mt-5 line-clamp-2 font-semibold text-white text-base group-hover:text-violet-100 transition-colors">{p.title}</h3>
                      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <FileStack className="size-3.5" />
                          {p.fileCount}개 파일
                        </span>
                        <span>{new Date(p.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs text-violet-200 opacity-0 transition-opacity group-hover:opacity-100">
                        열기
                        <ArrowUpRight className="size-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="bg-[#0b1020]/90 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
              <div className="mb-2">
                <h2 className="text-white text-xl font-semibold">프로필 편집</h2>
                <p className="mt-1 text-sm text-slate-500">공개 프로필과 포트폴리오 소유자 정보를 정리하세요.</p>
              </div>

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
                  className="bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  {profileSaving ? '저장 중...' : '저장'}
                </button>
                {profileSaved && (
                  <span className="inline-flex items-center gap-1.5 text-[#34d399] text-sm">
                    <CheckCircle2 className="size-4" />
                    저장됨
                  </span>
                )}
                {profile?.username && (
                  <Link
                    href={`/u/${profile.username}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[#a78bfa] text-xs hover:text-white ml-auto"
                  >
                    내 프로필 보기
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}
              </div>
            </div>

            <aside className="rounded-2xl border border-white/10 bg-[#0b1020]/80 p-5 backdrop-blur-xl">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Public card</p>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-violet-400/10 text-lg font-semibold text-violet-100">
                  {(profileForm.name || profile?.name || 'F').slice(0, 1).toUpperCase()}
                </div>
                <p className="font-semibold text-white">{profileForm.name || profile?.name || 'FolioSage creator'}</p>
                <p className="mt-1 text-sm text-violet-200">{profileForm.username ? `@${profileForm.username}` : '@username'}</p>
                {profileForm.bio && <p className="mt-3 text-sm leading-6 text-slate-400">{profileForm.bio}</p>}
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  {profileForm.location && (
                    <p className="inline-flex items-center gap-2">
                      <MapPin className="size-3.5" />
                      {profileForm.location}
                    </p>
                  )}
                  {(profileForm.linkedinUrl || profileForm.githubUrl) && (
                    <p className="flex items-center gap-2">
                      <LinkIcon className="size-3.5" />
                      외부 링크 연결됨
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
