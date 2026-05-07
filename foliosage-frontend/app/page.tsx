import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileCheck2,
  Files,
  Fingerprint,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const files = [
    { name: 'Brand system.pdf', type: 'Case Study', tone: 'violet' },
    { name: 'Campaign stills.zip', type: 'Assets', tone: 'cyan' },
    { name: 'Research notes.md', type: 'Research', tone: 'amber' },
  ]

  const capabilities = [
    {
      icon: Files,
      title: 'Auto-organized archive',
      desc: 'Projects, supporting files, and notes are grouped into a clean portfolio structure.',
    },
    {
      icon: MessageSquareText,
      title: 'Visitor-ready AI chat',
      desc: 'People can ask about your role, process, files, and outcomes without digging around.',
    },
    {
      icon: Fingerprint,
      title: 'Proof on every file',
      desc: 'Creation certificates keep a timestamped hash trail attached to your work.',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.14),transparent_26%),radial-gradient(circle_at_55%_82%,rgba(245,158,11,0.10),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.25),rgba(6,9,18,0.92)_48%,rgba(6,9,18,0.65))]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200 shadow-[0_0_24px_rgba(124,58,237,0.18)]">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="border border-violet-300/20 bg-violet-500 text-white shadow-[0_0_28px_rgba(124,58,237,0.28)] hover:bg-violet-400">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:pb-20">
        <div className="max-w-2xl animate-slide-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-xs font-medium text-cyan-100">
            <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.8)]" />
            AI-powered portfolio OS for serious creators
          </div>

          <h1 className="text-5xl font-semibold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
            Your work,
            <span className="block animate-shimmer-text">ready to answer.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Upload the messy archive behind your projects. FolioSage organizes the story,
            certifies the files, and gives visitors an AI guide that can explain the work.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-12 bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                Build your portfolio
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/10 bg-white/[0.03] px-5 text-sm text-slate-200 hover:bg-white/[0.07] hover:text-white"
              >
                Open workspace
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 text-xs text-slate-400">
            {[
              ['Files indexed', '128'],
              ['Chat answers', '2.4k'],
              ['Certificates', '100%'],
            ].map(([label, value]) => (
              <div key={label} className="border-l border-white/10 pl-3">
                <p className="text-lg font-semibold text-slate-100">{value}</p>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px] animate-spring-in lg:min-h-[620px]">
          <div className="absolute -inset-6 rounded-[32px] bg-[conic-gradient(from_140deg,rgba(124,58,237,0.18),rgba(20,184,166,0.16),rgba(245,158,11,0.10),rgba(124,58,237,0.18))] blur-2xl" />

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/90 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex h-12 items-center justify-between border-b border-white/10 bg-white/[0.025] px-4">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-rose-400/80" />
                <span className="size-2.5 rounded-full bg-amber-300/80" />
                <span className="size-2.5 rounded-full bg-emerald-300/80" />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/5 px-2.5 py-1 text-[11px] text-emerald-200">
                <CheckCircle2 className="size-3" />
                Published preview
              </div>
            </div>

            <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-[1fr_270px]">
              <div className="relative overflow-hidden p-4 sm:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.18),transparent_36%)]" />

                <div className="relative grid gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Workspace</p>
                        <h2 className="mt-1 text-xl font-semibold text-white">Launch Campaign Portfolio</h2>
                      </div>
                      <div className="hidden items-center gap-2 rounded-lg border border-violet-300/15 bg-violet-300/5 px-3 py-2 text-xs text-violet-100 sm:flex">
                        <Bot className="size-4" />
                        Organizing
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {files.map((file, i) => (
                        <div
                          key={file.name}
                          className="landing-file-card flex items-center gap-3 rounded-xl border border-white/10 bg-[#111827]/80 p-3"
                          style={{ animationDelay: `${i * 0.35}s` }}
                        >
                          <div
                            className={`flex size-10 items-center justify-center rounded-lg ${
                              file.tone === 'violet'
                                ? 'bg-violet-400/10 text-violet-200'
                                : file.tone === 'cyan'
                                  ? 'bg-cyan-400/10 text-cyan-100'
                                  : 'bg-amber-400/10 text-amber-100'
                            }`}
                          >
                            <FileCheck2 className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-100">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.type}</p>
                          </div>
                          <ShieldCheck className="size-4 text-emerald-300" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
                      <UploadCloud className="mb-5 size-5 text-cyan-200" />
                      <p className="text-2xl font-semibold text-white">18</p>
                      <p className="text-xs text-slate-500">files mapped to 4 stories</p>
                    </div>
                    <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
                      <Fingerprint className="mb-5 size-5 text-amber-200" />
                      <p className="text-2xl font-semibold text-white">SHA</p>
                      <p className="text-xs text-slate-500">certificates attached</p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="border-t border-white/10 bg-[#070b15]/85 p-4 lg:border-l lg:border-t-0">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-200">
                      <MessageSquareText className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">AI Guide</p>
                      <p className="text-[11px] text-slate-500">Answers from your work</p>
                    </div>
                  </div>
                  <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="rounded-xl rounded-tr-sm bg-white/[0.06] p-3 text-slate-200">
                    What was the creator&apos;s role in this launch?
                  </div>
                  <div className="landing-answer rounded-xl rounded-tl-sm border border-violet-300/15 bg-violet-300/[0.07] p-3 text-slate-200">
                    They led art direction, organized the asset system, and documented
                    the campaign from research through delivery.
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs text-emerald-200">
                      <ShieldCheck className="size-3.5" />
                      Verified source files
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="landing-progress h-full rounded-full bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-300" />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid gap-3 md:grid-cols-3">
          {capabilities.map((item, i) => (
            <div
              key={item.title}
              className="animate-slide-up rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.055]"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <item.icon className="mb-8 size-5 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
