import { ShieldCheck } from 'lucide-react'
import { MockAppNavbar, MockEyebrow, MockPill } from './mockup-primitives'

export function LandingMockStory({ active }: { active: boolean }) {
  const story = [
    { tag: 'My Role',  txt: 'Lead designer · brand + art direction. 캠페인 시각 시스템 총괄.' },
    { tag: 'Problem',  txt: '캠페인이 채널마다 분기되며 톤이 달랐고, 인용할 산출물이 흩어져 있었음.' },
    { tag: 'Solution', txt: '8주간 토큰화 → 자산 가이드 4개 → 런칭 마이크로사이트로 통합.' },
    { tag: 'Impact',   txt: '공유 자산 사용률 92%, CTR 18% 상승. 면접에서 매번 인용되는 케이스.' },
  ]

  return (
    <div style={{ background: '#070b15', minHeight: 480 }}>
      <MockAppNavbar right={<MockPill tone="violet" size="sm" dot>Story 생성 완료</MockPill>} />
      <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr 220px', gap: 14 }}>
        <div>
          {/* Summary card */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: 14, padding: '16px 18px',
            border: '1px solid rgba(167,139,250,0.22)',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(11,16,32,0.85) 65%)',
          }}>
            <MockEyebrow color="#c4b5fd" tracking="0.22em">Summary · Generated</MockEyebrow>
            <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.45 }}>
              봄 2026 캠페인 비주얼 시스템.<br />
              9주의 스프린트, 18개 파일,{' '}
              <span style={{ color: '#a5f3fc' }}>인용 가능한 4개 핵심 결정</span>.
            </p>
          </div>

          {/* Role / Problem / Solution / Impact */}
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {story.map((s, i) => (
              <div key={s.tag} style={{
                borderRadius: 11, padding: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(11,16,32,0.85)',
                animation: active ? `slide-up 0.5s ease ${0.2 + i * 0.1}s both` : 'none',
              }}>
                <MockEyebrow color="#a5f3fc" tracking="0.22em">{s.tag}</MockEyebrow>
                <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#e2e8f0', lineHeight: 1.55 }}>{s.txt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail: Evidence + Questions */}
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <div style={{
            borderRadius: 12, border: '1px solid rgba(110,231,183,0.20)',
            background: 'rgba(110,231,183,0.04)', padding: 12,
          }}>
            <MockEyebrow color="#a7f3d0" tracking="0.22em">Evidence Highlights</MockEyebrow>
            <div style={{ marginTop: 8, display: 'grid', gap: 5 }}>
              {['Brand system.pdf', 'Hero key visual.png', 'Research notes.md'].map((f, i) => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#cbd5e1',
                  animation: active ? `slide-up 0.4s ease ${0.4 + i * 0.1}s both` : 'none',
                }}>
                  <ShieldCheck size={11} style={{ color: '#6ee7b7', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderRadius: 12, border: '1px solid rgba(252,211,77,0.20)',
            background: 'rgba(252,211,77,0.04)', padding: 12,
          }}>
            <MockEyebrow color="#fde68a" tracking="0.22em">Interview Questions</MockEyebrow>
            <div style={{ marginTop: 8, display: 'grid', gap: 6, fontSize: 10.5, color: '#e2e8f0', lineHeight: 1.55 }}>
              <p style={{ margin: 0 }}>&ldquo;가장 어려웠던 의사결정은?&rdquo;</p>
              <p style={{ margin: 0 }}>&ldquo;CTR 18% 향상의 근거는?&rdquo;</p>
              <p style={{ margin: 0 }}>&ldquo;시스템 토큰을 8주에 정리한 비결?&rdquo;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
