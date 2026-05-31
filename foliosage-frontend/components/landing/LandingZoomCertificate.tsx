import { Award, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react'
import { MockEyebrow, MockPill, MONO_FONT } from './mockup-primitives'

export function LandingZoomCertificate({ active }: { active: boolean }) {
  const rows = [
    ['hash',  'SHA-256',  'a3f9c2b1ce5d…',       '#a7f3d0'],
    ['at',    'created',  '2026-04-12T14:08:21Z', '#cffafe'],
    ['size',  'bytes',    '4,247,168',             '#fde68a'],
    ['by',    'creator',  'minjoonkim',             '#ddd6fe'],
    ['sig',   'verified', '✓ FolioSage',           '#a7f3d0'],
  ] as const

  return (
    <div style={{
      position: 'relative', width: 'min(420px, 100%)', margin: '0 auto',
      borderRadius: 22, padding: '28px 26px 26px',
      border: '1px solid rgba(110,231,183,0.30)',
      background: 'linear-gradient(160deg, rgba(110,231,183,0.18), rgba(11,16,32,0.95) 60%)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 56px rgba(110,231,183,0.20)',
    }}>
      {/* shine overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, borderRadius: 22, pointerEvents: 'none',
        background: 'radial-gradient(circle at 100% 0%, rgba(110,231,183,0.30), transparent 50%)',
      }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{
            width: 44, height: 44, borderRadius: 12, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(110,231,183,0.22)', color: '#a7f3d0',
            boxShadow: '0 0 30px rgba(110,231,183,0.40)',
            animation: active ? 'glow-pulse 2.5s ease-in-out infinite' : 'none',
          }}>
            <Award size={22} />
          </span>
          <div>
            <MockEyebrow color="#a7f3d0" tracking="0.24em">Creation certificate</MockEyebrow>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>fs:proof:v1 · tamper-resistant</p>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          Brand system.pdf
        </p>
        <p style={{ margin: '4px 0 18px', fontSize: 12, color: '#94a3b8' }}>
          Hash, timestamp, and creator signature - proof that still works years later.
        </p>

        <div style={{
          padding: '14px 16px', borderRadius: 12,
          background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.06)',
          fontFamily: MONO_FONT, fontSize: 12, lineHeight: 1.9, color: '#cbd5e1',
        }}>
          {rows.map(([k, lbl, v, color], i) => (
            <div key={k} style={{
              display: 'flex', gap: 10, alignItems: 'baseline',
              animation: active ? `slide-up 0.4s ease ${0.15 + i * 0.12}s both` : 'none',
            }}>
              <span style={{ width: 40, color: '#475569' }}>{k}</span>
              <span style={{ width: 70, color: '#64748b' }}>{lbl}</span>
              <span style={{ color, flex: 1 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <MockPill tone="emerald" size="md" icon={<ShieldCheck size={11} />}>Verified</MockPill>
          <MockPill tone="cyan"    size="md" icon={<Fingerprint size={11} />}>Public proof</MockPill>
          <MockPill tone="violet"  size="md" icon={<Sparkles size={11} />}>Inline citation</MockPill>
        </div>
      </div>
    </div>
  )
}
