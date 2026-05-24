// Shared internal primitives for landing mockup components.
// These simulate the product UI appearance inside landing page mockup frames.

import type { CSSProperties, ReactNode } from 'react'

export const MONO_FONT = '"SFMono-Regular", Consolas, "Liberation Mono", monospace'

const PILL_TONES = {
  neutral: { bg: 'rgba(255,255,255,0.04)', bd: 'rgba(255,255,255,0.10)', fg: '#94a3b8', glow: 'rgba(255,255,255,0)' },
  emerald: { bg: 'rgba(110,231,183,0.08)', bd: 'rgba(110,231,183,0.22)', fg: '#a7f3d0', glow: 'rgba(110,231,183,0.7)' },
  amber:   { bg: 'rgba(252,211,77,0.07)',  bd: 'rgba(252,211,77,0.22)',  fg: '#fde68a', glow: 'rgba(252,211,77,0.6)' },
  cyan:    { bg: 'rgba(103,232,249,0.08)', bd: 'rgba(103,232,249,0.22)', fg: '#a5f3fc', glow: 'rgba(103,232,249,0.6)' },
  violet:  { bg: 'rgba(167,139,250,0.08)', bd: 'rgba(167,139,250,0.24)', fg: '#ddd6fe', glow: 'rgba(167,139,250,0.7)' },
  rose:    { bg: 'rgba(248,113,113,0.08)', bd: 'rgba(248,113,113,0.22)', fg: '#fecaca', glow: 'rgba(248,113,113,0.5)' },
}

type PillTone = keyof typeof PILL_TONES

export function MockPill({
  children, tone = 'neutral', dot, icon, size = 'md', style,
}: {
  children: ReactNode
  tone?: PillTone
  dot?: boolean
  icon?: ReactNode
  size?: 'sm' | 'md'
  style?: CSSProperties
}) {
  const t = PILL_TONES[tone]
  const sz = size === 'sm' ? { pad: '2px 8px', fs: 10, gap: 4 } : { pad: '4px 10px', fs: 11, gap: 6 }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: sz.gap,
      padding: sz.pad, borderRadius: 9999,
      background: t.bg, border: `1px solid ${t.bd}`, color: t.fg,
      fontSize: sz.fs, fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: 0.01,
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: t.fg, boxShadow: `0 0 12px ${t.glow}` }} />}
      {icon}
      {children}
    </span>
  )
}

export function MockEyebrow({
  children, color = '#a5f3fc', tracking = '0.26em',
}: {
  children: ReactNode
  color?: string
  tracking?: string
}) {
  return (
    <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: tracking, textTransform: 'uppercase', color }}>
      {children}
    </p>
  )
}

export function MockBtn({
  children, variant = 'primary', size = 'md', icon, iconRight, fullWidth, style,
}: {
  children?: ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  style?: CSSProperties
}) {
  const v = {
    primary: { bg: '#6d28d9', color: '#fff', bd: 'rgba(196,181,253,0.20)' },
    outline: { bg: 'rgba(255,255,255,0.03)', color: '#e2e8f0', bd: 'rgba(255,255,255,0.12)' },
    ghost:   { bg: 'transparent', color: '#cbd5e1', bd: 'transparent' },
  }[variant]
  const sz = { sm: { h: 28, px: 10, fs: 11 }, md: { h: 36, px: 14, fs: 12 } }[size]
  return (
    <span style={{
      height: sz.h, padding: `0 ${sz.px}px`, fontSize: sz.fs, fontWeight: 600,
      borderRadius: 9, border: `1px solid ${v.bd}`,
      background: v.bg, color: v.color,
      display: fullWidth ? 'flex' : 'inline-flex',
      alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
      whiteSpace: 'nowrap', width: fullWidth ? '100%' : undefined,
      ...style,
    }}>
      {icon}{children}{iconRight}
    </span>
  )
}

// Mini FOLIOSAGE logo mark for mockup navbars
export function MockLogoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{
        display: 'inline-flex', width: 22, height: 22,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 7, border: '1px solid rgba(167,139,250,0.25)',
        background: 'rgba(167,139,250,0.10)', color: '#c4b5fd',
      }}>
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1l1.5 4.5L14 6.5l-3 3 .5 4.5L8 12l-3.5 2 .5-4.5-3-3 4.5-1L8 1z" />
        </svg>
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: '#c4b5fd' }}>FOLIOSAGE</span>
    </div>
  )
}

// Mock product navbar used inside mockup screens
export function MockAppNavbar({ right }: { right?: ReactNode }) {
  return (
    <div style={{
      height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,11,21,0.72)',
    }}>
      <MockLogoMark />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{right}</div>
    </div>
  )
}
