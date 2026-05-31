'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Copy,
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
  storyReady: boolean
  aiReviewed: boolean
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
  const [profileEditing, setProfileEditing] = useState(true)
  const [profileCopied, setProfileCopied] = useState(false)
  const [tab, setTab] = useState<'portfolios' | 'profile'>('portfolios')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    api.get('/api/portfolios')
      .then(r => setPortfolios(r.data))
      .catch(() => setError('Could not load portfolios.'))
    api.get('/api/users/me')
      .then(r => {
        setProfile(r.data)
        setProfileForm(r.data)
        setProfileEditing(!r.data.username)
      })
      .catch(() => { /* profile optional */ })
  }, [router])

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileError('')
    try {
      const { data } = await api.patch('/api/users/me/profile', {
        username: profileForm.username?.trim() || null,
        bio: profileForm.bio?.trim() || null,
        location: profileForm.location?.trim() || null,
        linkedinUrl: profileForm.linkedinUrl?.trim() || null,
        githubUrl: profileForm.githubUrl?.trim() || null,
      })
      setProfile(data)
      setProfileForm(data)
      setProfileEditing(!data.username)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch (e: any) {
      setProfileError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Save failed')
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

  const profileUrl = profile?.username && typeof window !== 'undefined'
    ? `${window.location.origin}/u/${profile.username}`
    : ''

  const copyProfileLink = async () => {
    if (!profileUrl) return
    await navigator.clipboard.writeText(profileUrl)
    setProfileCopied(true)
    setTimeout(() => setProfileCopied(false), 1500)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(124,58,237,0.20),transparent_28%),radial-gradient(circle_at_84%_22%,rgba(20,184,166,0.12),transparent_26%),radial-gradient(circle_at_56%_90%,rgba(245,158,11,0.08),transparent_24%)]" />

      <nav className="relative z-10 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
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
              My profile
            </Link>
          )}
          <Link href="/portfolios/new"
            className="inline-flex items-center gap-2 bg-white hover:bg-cyan-100 text-slate-950 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <Plus className="size-3.5" />
            New portfolio
          </Link>
          <button
            onClick={() => { removeToken(); router.push('/login') }}
            className="inline-flex items-center gap-2 text-[#64748b] text-xs px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            <LogOut className="size-3.5" />
            Log out
          </button>
        </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-5 pb-14 pt-8 sm:px-8">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="animate-slide-up rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">Workspace overview</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  {profile?.name ? `${profile.name}'s portfolios` : 'Portfolio workspace'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Upload project files and turn them into evidence-backed portfolios you can explain in interviews.
                </p>
              </div>
              <Link href="/portfolios/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-400">
                <Plus className="size-4" />
                Create portfolio
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Portfolios', value: portfolios.length, icon: BriefcaseBusiness, color: 'text-violet-200' },
                { label: 'Published', value: publishedCount, icon: Globe2, color: 'text-emerald-200' },
                { label: 'Files', value: totalFiles, icon: FileStack, color: 'text-cyan-200' },
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
                    <p className="truncate text-sm font-semibold text-white">{profile?.username ? `@${profile.username}` : 'Profile not set'}</p>
                    <p className="text-xs text-slate-500">{profile?.bio || 'Add a short intro to your public profile.'}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays className="size-3.5" />
                  Recent work
                </div>
                <p className="truncate text-sm font-medium text-slate-200">
                  {latestPortfolio ? latestPortfolio.title : 'No portfolios yet.'}
                </p>
                {latestPortfolio && (
                  <p className="mt-1 text-xs text-slate-600">
                    {new Date(latestPortfolio.createdAt).toLocaleDateString('en-US')}
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
                {t === 'portfolios' ? 'Portfolios' : 'Profile'}
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
                <p className="text-slate-300 font-medium mb-2">No portfolios yet.</p>
                <p className="text-[#64748b] text-sm mb-5">Create your first workspace, upload files, and generate a Portfolio Story.</p>
                <Link href="/portfolios/new"
                  className="inline-flex items-center gap-2 bg-white hover:bg-cyan-100 text-slate-950 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  <Plus className="size-4" />
                  Create first portfolio
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
                          {p.published ? 'Published' : 'Private'}
                        </div>
                      </div>
                      <h3 className="mt-5 line-clamp-2 font-semibold text-white text-base group-hover:text-violet-100 transition-colors">{p.title}</h3>
                      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <FileStack className="size-3.5" />
                          {p.fileCount} files
                        </span>
                        <span>{new Date(p.createdAt).toLocaleDateString('en-US')}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-2 py-1 text-[11px] ${
                          p.storyReady ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200' : 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100'
                        }`}>
                          {p.storyReady ? 'Story ready' : 'Needs story'}
                        </span>
                        {p.published && (
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2 py-1 text-[11px] text-cyan-100">Published</span>
                        )}
                        {p.aiReviewed && (
                          <span className="rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-2 py-1 text-[11px] text-violet-100">AI reviewed</span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs text-violet-200 opacity-0 transition-opacity group-hover:opacity-100">
                        Open
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
            {profileEditing ? (
              <div className="bg-[#0b1020]/90 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-white text-xl font-semibold">Edit profile</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage your public profile and portfolio owner information.</p>
                  </div>
                  {profile?.username && (
                    <button
                      onClick={() => setProfileEditing(false)}
                      className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-400 transition-colors hover:text-white"
                    >
                      Close
                    </button>
                  )}
                </div>

                {field('Username', 'username', 'minjoonsage (letters, numbers, -, _)')}
                {field('Bio', 'bio', 'Write a short introduction')}
                {field('Location', 'location', 'Seoul, South Korea')}
                {field('LinkedIn URL', 'linkedinUrl', 'https://linkedin.com/in/username', 'url')}
                {field('GitHub URL', 'githubUrl', 'https://github.com/username', 'url')}

                {profileError && (
                  <div className="rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-200">
                    {profileError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm px-5 py-2.5 rounded-xl transition-colors"
                  >
                    {profileSaving ? 'Saving...' : 'Save'}
                  </button>
                  {profileSaved && (
                    <span className="inline-flex items-center gap-1.5 text-[#34d399] text-sm">
                      <CheckCircle2 className="size-4" />
                      Saved
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#0b1020]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">Public profile card</p>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-2xl font-semibold text-violet-100">
                    {(profile?.name || 'F').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-semibold text-white">{profile?.name || 'FolioSage creator'}</h2>
                    <p className="mt-1 text-sm text-violet-200">@{profile?.username}</p>
                    {profile?.bio && <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{profile.bio}</p>}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      {profile?.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {profile.location}
                        </span>
                      )}
                      {(profile?.linkedinUrl || profile?.githubUrl) && (
                        <span className="inline-flex items-center gap-1.5">
                          <LinkIcon className="size-3.5" />
                          External links connected
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        onClick={() => setProfileEditing(true)}
                        className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-300 transition-colors hover:text-white"
                      >
                        Edit profile
                      </button>
                      <Link
                        href={`/u/${profile?.username}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-400"
                      >
                        Open profile
                        <ExternalLink className="size-3.5" />
                      </Link>
                      <button
                        onClick={copyProfileLink}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-300 transition-colors hover:text-white"
                      >
                        {profileCopied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                        {profileCopied ? 'Copied' : 'Copy profile link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      External links connected
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
