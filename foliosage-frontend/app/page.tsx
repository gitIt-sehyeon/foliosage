'use client'

import Link from 'next/link'
import { useRef, useState, useEffect, type ReactNode, type CSSProperties } from 'react'
import {
  ArrowDown, ArrowRight, ArrowUpRight,
  Files, Fingerprint,
  Globe2, MessageSquareText, PlayCircle, ShieldCheck, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingMockOrganize } from '@/components/landing/LandingMockOrganize'
import { LandingMockStory } from '@/components/landing/LandingMockStory'
import { LandingMockReview } from '@/components/landing/LandingMockReview'
import { LandingMockVisitor } from '@/components/landing/LandingMockVisitor'
import { LandingZoomCertificate } from '@/components/landing/LandingZoomCertificate'
import { LandingZoomReadiness } from '@/components/landing/LandingZoomReadiness'
import { LandingZoomShare } from '@/components/landing/LandingZoomShare'

// ─── Scroll reveal hooks ──────────────────────────────────────────────────────

function useReveal(threshold = 0.18) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { setVisible(true); io.unobserve(e.target) } }),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, visible] as const
}

// ─── Shared landing primitives ────────────────────────────────────────────────

function Eyebrow({ children, color = '#a5f3fc', tracking = '0.28em' }: { children: ReactNode; color?: string; tracking?: string }) {
  return (
    <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: tracking, textTransform: 'uppercase', color }}>
      {children}
    </p>
  )
}

function Pill({
  children, tone = 'cyan', dot, icon, size = 'md',
}: { children: ReactNode; tone?: 'cyan' | 'violet' | 'emerald' | 'amber'; dot?: boolean; icon?: ReactNode; size?: 'sm' | 'md' }) {
  const tones = {
    cyan:    { bg: 'rgba(103,232,249,0.08)', bd: 'rgba(103,232,249,0.22)', fg: '#a5f3fc', glow: 'rgba(103,232,249,0.6)' },
    violet:  { bg: 'rgba(167,139,250,0.08)', bd: 'rgba(167,139,250,0.24)', fg: '#ddd6fe', glow: 'rgba(167,139,250,0.7)' },
    emerald: { bg: 'rgba(110,231,183,0.08)', bd: 'rgba(110,231,183,0.22)', fg: '#a7f3d0', glow: 'rgba(110,231,183,0.7)' },
    amber:   { bg: 'rgba(252,211,77,0.07)',  bd: 'rgba(252,211,77,0.22)',  fg: '#fde68a', glow: 'rgba(252,211,77,0.6)'  },
  }[tone]
  const sz = size === 'sm' ? { pad: '2px 8px', fs: 10, gap: 4 } : { pad: '4px 10px', fs: 11, gap: 6 }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: sz.gap,
      padding: sz.pad, borderRadius: 9999,
      background: tones.bg, border: `1px solid ${tones.bd}`, color: tones.fg,
      fontSize: sz.fs, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: tones.fg, boxShadow: `0 0 12px ${tones.glow}` }} />}
      {icon}
      {children}
    </span>
  )
}

// ─── FrameChrome ──────────────────────────────────────────────────────────────

function FrameChrome({ children, label, pill }: { children: ReactNode; label?: string; pill?: ReactNode }) {
  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.10)',
      background: 'rgba(11,16,32,0.92)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 40px rgba(124,58,237,0.10)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{
        height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: 'rgba(248,113,113,0.7)' }} />
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: 'rgba(252,211,77,0.7)' }} />
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: 'rgba(110,231,183,0.7)' }} />
        </div>
        {label && (
          <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'SFMono-Regular, Consolas, monospace', letterSpacing: 0.02 }}>
            {label}
          </span>
        )}
        {pill ?? <span />}
      </div>
      <div>{children}</div>
    </div>
  )
}

// ─── Halo glow behind mockups ─────────────────────────────────────────────────

function Halo({ color = 'violet', size = 'lg' }: { color?: 'violet' | 'cyan' | 'emerald' | 'amber'; size?: 'sm' | 'md' | 'lg' }) {
  const palettes = {
    violet:  'conic-gradient(from 140deg, rgba(124,58,237,0.28), rgba(20,184,166,0.20), rgba(245,158,11,0.14), rgba(124,58,237,0.28))',
    cyan:    'conic-gradient(from 220deg, rgba(34,211,238,0.24), rgba(124,58,237,0.22), rgba(110,231,183,0.16), rgba(34,211,238,0.24))',
    emerald: 'conic-gradient(from 60deg, rgba(110,231,183,0.24), rgba(34,211,238,0.18), rgba(167,139,250,0.16), rgba(110,231,183,0.24))',
    amber:   'conic-gradient(from 100deg, rgba(245,158,11,0.20), rgba(167,139,250,0.20), rgba(34,211,238,0.18), rgba(245,158,11,0.20))',
  }[color]
  const blur = size === 'sm' ? 60 : size === 'md' ? 80 : 100
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: -50, borderRadius: '50%',
      background: palettes,
      filter: `blur(${blur}px)`, opacity: 0.65, pointerEvents: 'none', zIndex: 0,
    }} />
  )
}

// ─── MomentCopy ───────────────────────────────────────────────────────────────

function MomentCopy({
  n, tag, title, body, align = 'left', narrow = false,
}: {
  n: string; tag: string; title: string; body: ReactNode; align?: 'left' | 'right'; narrow?: boolean
}) {
  return (
    <div style={{ maxWidth: narrow ? 460 : 620, textAlign: align }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 13, letterSpacing: '0.12em', color: '#a78bfa' }}>
          {n}
        </span>
        <span style={{ width: 32, height: 1, background: '#a78bfa' }} />
        <Pill tone="violet">{tag}</Pill>
      </div>
      <h3 style={{
        margin: 0,
        fontSize: 'clamp(30px, 3.6vw, 52px)',
        fontWeight: 600, lineHeight: 1.04, letterSpacing: '-0.025em', color: '#fff',
      }}>
        {title}
      </h3>
      <p style={{ margin: '20px 0 0', fontSize: 17, color: '#94a3b8', lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

// ─── MomentHero ───────────────────────────────────────────────────────────────

function MomentHero({
  n, tag, title, body, MockEl, color = 'violet', frameLabel, align = 'left',
}: {
  n: string; tag: string; title: string; body: ReactNode; MockEl: ReactNode
  color?: 'violet' | 'cyan' | 'emerald' | 'amber'; frameLabel?: string; align?: 'left' | 'right'
}) {
  const [ref, visible] = useReveal(0.15)
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        position: 'relative', zIndex: 2, padding: '14vh 32px',
        minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        maxWidth: 1280, margin: '0 auto',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s, transform 0.7s',
        marginBottom: 48,
      }}>
        <MomentCopy n={n} tag={tag} title={title} body={body} align={align} />
      </div>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 1100, margin: '0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
        transition: 'opacity 0.8s 0.15s, transform 0.9s 0.15s var(--ease-spring)',
      }}>
        <Halo color={color} size="lg" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <FrameChrome label={frameLabel} pill={<Pill tone="violet" size="sm">{n}</Pill>}>
            {MockEl}
          </FrameChrome>
        </div>
      </div>
    </section>
  )
}

// ─── MomentZoom ───────────────────────────────────────────────────────────────

function MomentZoom({
  n, tag, title, body, ZoomEl, color = 'emerald', reverse = false,
}: {
  n: string; tag: string; title: string; body: ReactNode; ZoomEl: ReactNode
  color?: 'violet' | 'cyan' | 'emerald' | 'amber'; reverse?: boolean
}) {
  const [ref, visible] = useReveal(0.2)
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        position: 'relative', zIndex: 2, padding: '12vh 32px',
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        maxWidth: 1280, margin: '0 auto',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%' }}>
        <div style={{
          order: reverse ? 2 : 1,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : `translateX(${reverse ? 30 : -30}px)`,
          transition: 'opacity 0.7s, transform 0.7s',
        }}>
          <MomentCopy n={n} tag={tag} title={title} body={body} narrow />
        </div>
        <div style={{
          order: reverse ? 1 : 2, position: 'relative',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.94)',
          transition: 'opacity 0.8s 0.15s, transform 0.9s 0.15s var(--ease-spring)',
        }}>
          <Halo color={color} size="md" />
          <div style={{ position: 'relative', zIndex: 1 }}>{ZoomEl}</div>
        </div>
      </div>
    </section>
  )
}

// ─── Background layers ────────────────────────────────────────────────────────

function BackgroundLayers() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div
        className="pointer-events-none absolute inset-0 animate-aurora"
        style={{
          background:
            'radial-gradient(circle at 18% 14%, rgba(124,58,237,0.28), transparent 30%),' +
            'radial-gradient(circle at 84% 22%, rgba(34,211,238,0.18), transparent 28%),' +
            'radial-gradient(circle at 56% 88%, rgba(245,158,11,0.12), transparent 26%)',
          backgroundSize: '400% 400%',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.25),rgba(6,9,18,0.92)_48%,rgba(6,9,18,0.65))]" />
    </>
  )
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

function TopNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-200 shadow-[0_0_24px_rgba(124,58,237,0.18)]">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-[0.26em] text-violet-100">FOLIOSAGE</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="border border-violet-300/20 bg-violet-500 text-white shadow-[0_0_28px_rgba(124,58,237,0.28)] hover:bg-violet-400">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [ref, visible] = useReveal(0.1)
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '40px 32px 56px' }}
    >
      <div style={{ maxWidth: 980 }}>
        {/* Pill */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.6s, transform 0.6s',
        }}>
          <Pill tone="cyan" dot>Project files → verified portfolio → AI guide</Pill>
        </div>

        {/* H1 */}
        <h1 style={{
          margin: '22px 0 0',
          fontSize: 'clamp(52px, 8vw, 128px)',
          fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.035em', color: '#fff',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s 0.05s, transform 0.7s 0.05s',
        }}>
          <span style={{ display: 'block' }}>Ask your</span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(120deg, #a78bfa 0%, #ffffff 35%, #67e8f9 70%, #a78bfa 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            color: 'transparent',
            animation: 'shimmer 4s linear infinite',
          }}>
            portfolio.
          </span>
        </h1>

        {/* Subtext */}
        <p style={{
          margin: '28px 0 0', maxWidth: 600,
          fontSize: 17, lineHeight: 1.55, color: '#cbd5e1',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s 0.15s, transform 0.7s 0.15s',
        }}>
          AI organizes your uploaded project files into an interview-ready story.
          Every file is hash-certified, and visitors can ask questions about the work directly.
        </p>

        {/* CTAs */}
        <div style={{
          marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s 0.25s, transform 0.7s 0.25s',
        }}>
          <Link href="/signup">
            <Button size="lg" className="h-12 bg-violet-600 px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,58,237,0.32)] hover:bg-violet-500">
              Create portfolio
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 border-white/10 bg-white/[0.03] px-6 text-sm text-slate-200 hover:bg-white/[0.07] hover:text-white">
              <PlayCircle className="size-4" />
              Explore demo
            </Button>
          </Link>
        </div>

        {/* Down indicator */}
        <div style={{
          marginTop: 52, display: 'inline-flex', alignItems: 'center', gap: 10,
          fontSize: 11, color: '#64748b', letterSpacing: '0.24em', textTransform: 'uppercase',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s 0.6s',
        }}>
          <span style={{
            display: 'inline-flex', width: 30, height: 30, borderRadius: 9999,
            border: '1px solid rgba(255,255,255,0.10)',
            alignItems: 'center', justifyContent: 'center', color: '#a5f3fc',
            animation: 'dp-float 3.5s ease-in-out infinite',
          }}>
            <ArrowDown size={12} />
          </span>
          Scroll to see how it works
        </div>
      </div>
    </section>
  )
}

// ─── MomentsIntro ─────────────────────────────────────────────────────────────

function MomentsIntro() {
  const [ref, visible] = useReveal(0.3)
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '10vh 32px 4vh' }}
    >
      <div style={{
        maxWidth: 880,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s, transform 0.7s',
      }}>
        <Eyebrow tracking="0.28em">How it works · 7 moments</Eyebrow>
        <h2 style={{
          margin: '14px 0 0',
          fontSize: 'clamp(36px, 4.6vw, 68px)',
          fontWeight: 600, lineHeight: 1.02, letterSpacing: '-0.028em', color: '#fff',
        }}>
          From upload to interview,<br />
          <span style={{
            background: 'linear-gradient(120deg, #a78bfa, #67e8f9 60%, #fde68a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            in seven moments.
          </span>
        </h2>
        <p style={{ margin: '20px 0 0', fontSize: 17, color: '#94a3b8', lineHeight: 1.65, maxWidth: 680 }}>
          The strongest moments in the workflow, shown with real product screens.
        </p>
      </div>
    </section>
  )
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

function Capabilities() {
  const [ref, visible] = useReveal(0.18)
  const caps = [
    { Icon: Files,             tone: 'violet' as const, fg: '#c4b5fd', t: 'Automatically organized archive', d: 'Group project files, support materials, and notes into a clean portfolio structure.' },
    { Icon: MessageSquareText, tone: 'cyan'   as const, fg: '#a5f3fc', t: 'Visitor AI chat', d: 'Visitors can ask directly about your role, process, files, and results.' },
    { Icon: Fingerprint,       tone: 'amber'  as const, fg: '#fde68a', t: 'Proof on every file', d: 'Timestamped hash certificates are attached automatically.' },
    { Icon: ShieldCheck,       tone: 'emerald' as const, fg: '#a7f3d0', t: 'Verified source citations', d: 'AI answers include the original evidence files they rely on.' },
  ]

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '80px 32px 56px' }}
    >
      <div style={{ marginBottom: 32 }}>
        <Eyebrow tracking="0.28em">Why FolioSage</Eyebrow>
        <h2 style={{
          margin: '12px 0 0',
          fontSize: 'clamp(28px, 3.4vw, 48px)',
          fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.022em', color: '#fff', maxWidth: 760,
        }}>
          More than a gallery.{' '}
          <span style={{
            background: 'linear-gradient(120deg, #a78bfa, #67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            An evidence-backed portfolio OS.
          </span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {caps.map((c, i) => (
          <CapabilityCard key={c.t} {...c} visible={visible} delay={0.1 + i * 0.08} />
        ))}
      </div>
    </section>
  )
}

function CapabilityCard({
  Icon, fg, t, d, visible, delay,
}: {
  Icon: React.ElementType; fg: string; t: string; d: string; visible: boolean; delay: number
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 16, padding: '22px 20px',
        border: `1px solid ${hover ? 'rgba(124,58,237,0.40)' : 'rgba(255,255,255,0.08)'}`,
        background: hover ? 'rgba(11,16,32,0.92)' : 'rgba(11,16,32,0.70)',
        backdropFilter: 'blur(20px)',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ${delay}s, transform 0.6s ${delay}s, border-color 0.2s, background 0.2s`,
        cursor: 'default',
      }}
    >
      <span style={{ color: fg, display: 'inline-block', marginBottom: 24 }}>
        <Icon size={22} />
      </span>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{t}</p>
      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{d}</p>
    </div>
  )
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

const PORTFOLIOS = [
  {
    tag: 'Brand · Campaign', author: 'Minjun Kim', role: 'Lead designer',
    title: 'Launch Campaign Portfolio',
    desc: 'A spring 2026 campaign visual system built across a nine-week sprint with 18 verified files.',
    stats: [['Files', '18'], ['AI answers', '342'], ['Views', '1.2k']],
    mesh: 'linear-gradient(135deg, #1e1b4b, #0b1020 60%, #0f172a)',
    blobs: ['rgba(167,139,250,0.55)', 'rgba(34,211,238,0.40)', 'rgba(245,158,11,0.35)'],
    pills: [['emerald', '18 verified'], ['violet', 'AI reviewed'], ['cyan', 'Live']] as [string, string][],
    slug: 'launch',
  },
  {
    tag: 'Product · UX', author: 'Seoyeon Park', role: 'Product designer',
    title: 'Mobile Onboarding Study',
    desc: 'Five hypotheses validated with A/B tests and 22 cited user interview notes.',
    stats: [['Files', '11'], ['AI answers', '128'], ['Views', '844']],
    mesh: 'linear-gradient(135deg, #0c4a6e, #0b1020 55%, #075985)',
    blobs: ['rgba(34,211,238,0.50)', 'rgba(167,139,250,0.30)', 'rgba(110,231,183,0.30)'],
    pills: [['emerald', '11 verified'], ['violet', 'AI reviewed']] as [string, string][],
    slug: 'mobile',
  },
  {
    tag: 'Frontend · System', author: 'Jiho Lee', role: 'Frontend engineer',
    title: 'Editorial Site — Components',
    desc: '42 components, 12 design tokens, and notes connecting code to design decisions.',
    stats: [['Files', '32'], ['AI answers', '210'], ['Views', '564']],
    mesh: 'linear-gradient(135deg, #052e2b, #0b1020 60%, #064e3b)',
    blobs: ['rgba(110,231,183,0.50)', 'rgba(34,211,238,0.35)', 'rgba(252,211,77,0.25)'],
    pills: [['emerald', '32 verified'], ['cyan', 'Public']] as [string, string][],
    slug: 'editorial',
  },
]

function Gallery() {
  const [ref, visible] = useReveal(0.15)
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '80px 32px' }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        gap: 24, marginBottom: 32, flexWrap: 'wrap',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s, transform 0.6s',
      }}>
        <div style={{ maxWidth: 680 }}>
          <Eyebrow tracking="0.28em">Examples · Live portfolios</Eyebrow>
          <h2 style={{
            margin: '12px 0 0',
            fontSize: 'clamp(32px, 3.8vw, 56px)',
            fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.022em', color: '#fff',
          }}>
            See portfolios come alive.
          </h2>
          <p style={{ margin: '14px 0 0', fontSize: 15, color: '#94a3b8', lineHeight: 1.6, maxWidth: 540 }}>
            Example FolioSage portfolios. Each card points to a live public page.
          </p>
        </div>
        <Link href="/signup">
          <Button variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]">
            View gallery
            <ArrowUpRight className="size-4" />
          </Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {PORTFOLIOS.map((p, i) => (
          <GalleryCard key={p.title} p={p} visible={visible} delay={0.15 + i * 0.1} />
        ))}
      </div>
    </section>
  )
}

function GalleryCard({
  p, visible, delay,
}: {
  p: typeof PORTFOLIOS[0]; visible: boolean; delay: number
}) {
  const [hover, setHover] = useState(false)
  const pillTones: Record<string, string> = { emerald: '#a7f3d0', violet: '#ddd6fe', cyan: '#a5f3fc' }
  const pillBds: Record<string, string>  = { emerald: 'rgba(110,231,183,0.22)', violet: 'rgba(167,139,250,0.24)', cyan: 'rgba(103,232,249,0.22)' }
  const pillBgs: Record<string, string>  = { emerald: 'rgba(110,231,183,0.08)', violet: 'rgba(167,139,250,0.08)', cyan: 'rgba(103,232,249,0.08)' }

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 18, overflow: 'hidden',
        border: `1px solid ${hover ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.08)'}`,
        background: 'rgba(11,16,32,0.85)', backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column',
        opacity: visible ? 1 : 0,
        transform: visible ? (hover ? 'translateY(-4px)' : 'translateY(0)') : 'translateY(28px)',
        transition: `opacity 0.6s ${delay}s, transform ${visible ? '0.3s' : `0.7s ${delay}s`}, border-color 0.25s`,
        cursor: 'pointer',
      }}
    >
      {/* Cover */}
      <div style={{
        position: 'relative', height: 200, overflow: 'hidden',
        background:
          `radial-gradient(circle at 25% 30%, ${p.blobs[0]}, transparent 50%),` +
          `radial-gradient(circle at 80% 65%, ${p.blobs[1]}, transparent 55%),` +
          `radial-gradient(circle at 60% 20%, ${p.blobs[2]}, transparent 45%),` +
          p.mesh,
      }}>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {p.pills.map(([tone, label]) => (
            <span key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
              borderRadius: 9999, fontSize: 10, fontWeight: 500,
              background: pillBgs[tone], border: `1px solid ${pillBds[tone]}`, color: pillTones[tone],
            }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          fontFamily: 'SFMono-Regular, Consolas, monospace',
          fontSize: 10, color: 'rgba(255,255,255,0.55)',
          background: 'rgba(11,16,32,0.6)', padding: '3px 8px', borderRadius: 9999,
          backdropFilter: 'blur(6px)',
        }}>
          /p/{p.slug}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a5f3fc' }}>
            {p.tag}
          </p>
          <h3 style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.012em', lineHeight: 1.25 }}>{p.title}</h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8', lineHeight: 1.55 }}>{p.desc}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 9999, background: 'linear-gradient(135deg, #7c3aed, #22d3ee)' }} />
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{p.author}</p>
            <p style={{ margin: 0, fontSize: 10.5, color: '#64748b' }}>{p.role}</p>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
          paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {p.stats.map(([l, v]) => (
            <div key={l}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{v}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#c4b5fd' }}>
          Open live page <ArrowUpRight size={13} />
        </div>
      </div>
    </article>
  )
}

// ─── FinalCTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  const [ref, visible] = useReveal(0.18)
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '56px 32px 80px' }}
    >
      <div style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 28, padding: '72px 48px 64px',
        border: '1px solid rgba(167,139,250,0.22)',
        background:
          'radial-gradient(ellipse at 30% 30%, rgba(124,58,237,0.36), transparent 55%),' +
          'radial-gradient(ellipse at 80% 70%, rgba(34,211,238,0.18), transparent 60%),' +
          'linear-gradient(135deg, rgba(15,23,42,0.5), rgba(6,9,18,0.95) 60%)',
        textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.96)',
        transition: 'opacity 0.7s, transform 0.7s var(--ease-spring)',
      }}>
        {/* aurora overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'conic-gradient(from 140deg at 50% 50%, transparent, rgba(167,139,250,0.16), transparent, rgba(103,232,249,0.12), transparent)',
          filter: 'blur(60px)', opacity: 0.7,
        }} />
        {/* grid */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        <div style={{ position: 'relative' }}>
          <Pill tone="cyan" dot>Free during beta · first portfolio in 5 minutes</Pill>

          <h2 style={{
            margin: '24px auto 0',
            fontSize: 'clamp(42px, 6vw, 96px)',
            fontWeight: 600, lineHeight: 0.95, letterSpacing: '-0.035em', color: '#fff',
            maxWidth: 1000,
          }}>
            The files you already have<br />
            <span style={{
              background: 'linear-gradient(120deg, #a78bfa 0%, #67e8f9 50%, #fde68a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              become your next opportunity.
            </span>
          </h2>

          <p style={{ margin: '24px auto 0', maxWidth: 580, fontSize: 16, color: '#cbd5e1', lineHeight: 1.6 }}>
            Upload, organize, generate an AI guide, and publish a link in under an hour.
          </p>

          <div style={{ marginTop: 36, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <Button size="lg" className="h-12 bg-violet-600 px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,58,237,0.32)] hover:bg-violet-500">
                Start now
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 border-white/10 bg-white/[0.03] px-6 text-sm text-slate-200 hover:bg-white/[0.07]">
                <Globe2 className="size-4" />
                View sample page
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto',
      padding: '24px 32px 56px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          display: 'inline-flex', width: 28, height: 28,
          alignItems: 'center', justifyContent: 'center',
          borderRadius: 9, border: '1px solid rgba(167,139,250,0.25)',
          background: 'rgba(167,139,250,0.10)', color: '#c4b5fd',
        }}>
          <Sparkles size={14} />
        </span>
        <span style={{ fontSize: 11, color: '#64748b' }}>Your portfolio can speak for itself.</span>
      </div>
      <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#64748b' }}>
        {[['Guide', '#'], ['Pricing', '#'], ['About', '#'], ['Privacy', '#']].map(([label, href]) => (
          <Link key={label} href={href} className="text-slate-500 transition-colors hover:text-slate-300">{label}</Link>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>© 2026 FolioSage</p>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
      <BackgroundLayers />
      <TopNav />
      <Hero />
      <MomentsIntro />

      {/* H1 — Upload + Organize */}
      <MomentHero
        n="01" tag="Upload + Organize"
        title="Drop files in. FolioSage groups them by meaning."
        body="Plans, images, code, PDFs, and archives are classified into System, Visual, Document, and Deliverable lanes. Every file is certified with a SHA-256 hash."
        MockEl={<LandingMockOrganize active />}
        frameLabel="foliosage.app / smart-organizer"
        color="violet"
      />

      {/* Z1 — Certificate */}
      <MomentZoom
        n="02" tag="Creation certificate"
        title="One file, one certificate."
        body="Each upload is sealed with a SHA-256 hash and timestamp, so you can prove when the work was created."
        ZoomEl={<LandingZoomCertificate active />}
        color="emerald"
      />

      {/* H2 — Story generation */}
      <MomentHero
        n="03" tag="Generate Story"
        title="Summary · Role · Problem · Solution · Impact."
        body="Generate Story fills the five core sections, evidence highlights, and likely interview questions while keeping the final edit under your control."
        MockEl={<LandingMockStory active />}
        frameLabel="foliosage.app / portfolio / story"
        color="cyan"
      />

      {/* Z2 — Readiness */}
      <MomentZoom
        n="04" tag="Readiness"
        title="Is it ready to submit?"
        body="Story, Evidence, AI Review, and Public Link readiness are summarized in one score so you know what still needs work."
        ZoomEl={<LandingZoomReadiness active />}
        color="violet"
        reverse
      />

      {/* H3 — AI Review */}
      <MomentHero
        n="05" tag="AI Portfolio Review"
        title="Not just a chatbot. It reviews against your uploaded files."
        body="AI asks interview-style questions, evaluates your answers, and points out cited evidence and missing proof."
        MockEl={<LandingMockReview active />}
        frameLabel="foliosage.app / defense-room"
        color="amber"
        align="right"
      />

      {/* Z3 — Share */}
      <MomentZoom
        n="06" tag="Live link"
        title="One link. A living portfolio page."
        body="Publish to /p/<code> with verified files, an AI Guide, cited evidence, and generated SEO metadata."
        ZoomEl={<LandingZoomShare active />}
        color="emerald"
      />

      {/* H4 — Visitor + AI Chat */}
      <MomentHero
        n="07" tag="Visitor · AI Guide"
        title="Visitors ask. Your work answers."
        body="The AI Guide answers questions from the organized story and evidence grid, with source files attached where available."
        MockEl={<LandingMockVisitor active />}
        frameLabel="foliosage.com / p / 9k7m2-launch"
        color="cyan"
      />

      <Capabilities />
      <Gallery />
      <FinalCTA />
      <Footer />
    </main>
  )
}
