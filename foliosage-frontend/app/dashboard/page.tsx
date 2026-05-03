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
