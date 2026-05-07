'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileStack, MessageSquareText, Sparkles } from 'lucide-react'
import { isLoggedIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

export default function NewPortfolioPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!isLoggedIn()) router.push('/login') }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/portfolios', form)
      router.push(`/portfolios/${data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create portfolio.')
    } finally { setLoading(false) }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_76%_28%,rgba(20,184,166,0.12),transparent_25%)]" />

      <nav className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white">
            <ArrowLeft className="size-4" />
            Dashboard
          </Button>
        </Link>
      </nav>

      <main className="relative z-10 mx-auto grid max-w-5xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">New portfolio</p>
          <h1 className="max-w-lg text-5xl font-semibold leading-tight">Start with a clear story, then add the source files.</h1>
          <div className="mt-8 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <FileStack className="mb-6 size-5 text-violet-200" />
              <p className="text-sm font-medium text-white">Upload project files after creation</p>
              <p className="mt-1 text-sm text-slate-500">FolioSage will index and prepare them for organization.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <MessageSquareText className="mb-6 size-5 text-cyan-200" />
              <p className="text-sm font-medium text-white">Public AI context comes next</p>
              <p className="mt-1 text-sm text-slate-500">Visitors can ask questions once the portfolio is published.</p>
            </div>
          </div>
        </section>

        <section className="animate-spring-in rounded-2xl border border-white/10 bg-[#0b1020]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <p className="text-sm text-violet-200">Create portfolio</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Define the workspace</h2>
            <p className="mt-2 text-sm text-slate-500">Give this portfolio a focused name before uploading files.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Portfolio Title</Label>
                <Input value={form.title}
                       onChange={e => setForm({...form, title: e.target.value})}
                       placeholder="e.g. UI/UX Design Work 2026"
                       className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus-visible:ring-violet-400/30"
                       required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Description (optional)</Label>
                <Input value={form.description}
                       onChange={e => setForm({...form, description: e.target.value})}
                       placeholder="Brief description of this portfolio"
                       className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus-visible:ring-violet-400/30" />
              </div>
              {error && <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
              <Button type="submit" className="h-11 w-full bg-white text-slate-950 hover:bg-cyan-100" disabled={loading}>
                {loading ? 'Creating...' : 'Create Portfolio'}
                <ArrowRight className="size-4" />
              </Button>
            </form>
        </section>
      </main>
    </div>
  )
}
