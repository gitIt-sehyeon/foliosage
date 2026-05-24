import { CheckCircle2, Circle } from 'lucide-react'
import { MockEyebrow, MockPill } from './mockup-primitives'

export function LandingZoomReadiness({ active }: { active: boolean }) {
  const score = 87
  const checks = [
    { l: 'Story 작성',       d: '4/4 섹션',    ok: true  },
    { l: 'Evidence 연결',    d: '18개 인증됨', ok: true  },
    { l: 'AI Review 통과',   d: '점수 79/100', ok: true  },
    { l: 'Public Link 발급', d: '대기 중',      ok: false },
  ]

  return (
    <div style={{
      position: 'relative', width: 'min(440px, 100%)', margin: '0 auto',
      borderRadius: 22, padding: '28px 28px 24px',
      border: '1px solid rgba(167,139,250,0.25)',
      background: 'linear-gradient(160deg, rgba(124,58,237,0.22), rgba(11,16,32,0.95) 65%)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 56px rgba(124,58,237,0.20)',
    }}>
      <MockEyebrow color="#c4b5fd" tracking="0.24em">Readiness · 제출 준비도</MockEyebrow>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 14 }}>
        {/* SVG gauge */}
        <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="zoom-readiness-gauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#a78bfa" />
                <stop offset="60%"  stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r="42"
              stroke="url(#zoom-readiness-gauge)"
              strokeWidth="8" fill="none"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={`${active ? score : 0} 100`}
              style={{
                transform: 'rotate(-90deg)', transformOrigin: '50% 50%',
                transition: 'stroke-dasharray 2s var(--ease-spring)',
              }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 42, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
              {score}
            </p>
            <p style={{ margin: '-4px 0 0', fontSize: 11, color: '#94a3b8', letterSpacing: '0.06em' }}>/ 100</p>
          </div>
        </div>

        {/* Right blurb */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>제출 가능</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>
            공개 링크만 발급하면 끝. AI Guide도 학습 완료.
          </p>
          <div style={{ marginTop: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <MockPill tone="emerald" size="sm">Story</MockPill>
            <MockPill tone="emerald" size="sm">Evidence</MockPill>
            <MockPill tone="emerald" size="sm">AI</MockPill>
            <MockPill tone="amber"   size="sm">Link</MockPill>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gap: 6 }}>
        {checks.map((c, i) => (
          <div key={c.l} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 11,
            border: '1px solid ' + (c.ok ? 'rgba(110,231,183,0.18)' : 'rgba(252,211,77,0.16)'),
            background: c.ok ? 'rgba(110,231,183,0.04)' : 'rgba(252,211,77,0.04)',
            animation: active ? `slide-up 0.4s ease ${0.2 + i * 0.08}s both` : 'none',
          }}>
            <span style={{ color: c.ok ? '#6ee7b7' : '#fcd34d' }}>
              {c.ok ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </span>
            <p style={{ margin: 0, flex: 1, fontSize: 13, fontWeight: 500, color: '#fff' }}>{c.l}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
