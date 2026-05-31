'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Bot, FileCheck2, Fingerprint, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isAxiosError } from 'axios'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/auth/login', form)
      setToken(data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.error ?? 'Login failed.') : 'An unexpected error occurred.')
    } finally { setLoading(false) }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_82%_28%,rgba(20,184,166,0.12),transparent_24%)]" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
        </Link>
        <Link href="/signup" className="text-sm text-slate-400 transition-colors hover:text-white">
          Create account
        </Link>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden max-w-xl animate-slide-up lg:block">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">Creator workspace</p>
          <h1 className="text-5xl font-semibold leading-tight">Return to your living portfolio.</h1>
          <p className="mt-5 text-base leading-7 text-slate-400">
            Continue organizing source files, publishing polished portfolio views, and letting AI answer from your work.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              { icon: Bot, title: 'AI context stays with the portfolio' },
              { icon: FileCheck2, title: 'Every uploaded file keeps its proof trail' },
              { icon: Fingerprint, title: 'Public pages are ready for review and sharing' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
                <item.icon className="size-4 text-cyan-200" />
                {item.title}
              </div>
            ))}
          </div>
        </div>

        <div className="animate-spring-in rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <p className="text-sm text-violet-200">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Sign in to FolioSage</h2>
            <p className="mt-2 text-sm text-slate-500">Manage your portfolio OS and public AI guide.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({...prev, email: e.target.value}))}
                className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus-visible:ring-violet-400/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({...prev, password: e.target.value}))}
                className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus-visible:ring-violet-400/30"
                required
              />
            </div>
            {error && <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <Button type="submit" className="h-11 w-full bg-white text-slate-950 hover:bg-cyan-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="size-4" />
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-500">
                <span className="bg-[#0b1020] px-2">or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07] hover:text-white"
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/oauth2/authorization/google`
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <p className="text-center text-sm text-slate-500">
              No account? <Link href="/signup" className="text-violet-200 hover:text-white">Sign up</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
