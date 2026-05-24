import { Bot, ShieldCheck, Sparkles } from 'lucide-react'
import { MockAppNavbar, MockEyebrow, MockPill } from './mockup-primitives'

export function LandingMockReview({ active }: { active: boolean }) {
  const rubric = [
    { k: '명확성',    v: 92, tone: 'emerald' as const },
    { k: '근거 인용', v: 88, tone: 'emerald' as const },
    { k: '결과 측정', v: 74, tone: 'amber'   as const },
    { k: '대안 비교', v: 62, tone: 'amber'   as const },
  ]

  return (
    <div style={{ background: '#070b15', minHeight: 480 }}>
      <MockAppNavbar right={
        <>
          <MockPill tone="violet" size="sm" icon={<Sparkles size={10} />}>AI Review</MockPill>
          <MockPill tone="emerald" size="sm" icon={<ShieldCheck size={10} />}>업로드 파일 근거</MockPill>
        </>
      } />
      <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14 }}>
        {/* Q/A column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <MockEyebrow color="#c4b5fd" tracking="0.24em">Defense room · 면접 시뮬레이션</MockEyebrow>

          {/* Question */}
          <div style={{
            borderRadius: 12, padding: '10px 14px',
            border: '1px solid rgba(167,139,250,0.22)', background: 'rgba(167,139,250,0.06)',
            animation: active ? 'slide-up 0.5s ease 0.1s both' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <Bot size={13} style={{ color: '#c4b5fd' }} />
              <p style={{ margin: 0, fontSize: 10.5, color: '#c4b5fd', fontWeight: 600 }}>AI 심사관 · Q.3</p>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#fff', lineHeight: 1.55 }}>
              CTR 18% 상승은 어떤 변수의 영향이라고 보시나요? 근거 파일은요?
            </p>
          </div>

          {/* User answer */}
          <div style={{
            alignSelf: 'flex-end', maxWidth: '88%',
            borderRadius: 12, padding: '10px 14px',
            background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
            color: '#fff', fontSize: 12.5, lineHeight: 1.55,
            boxShadow: '0 8px 20px rgba(109,40,217,0.30)',
            animation: active ? 'slide-up 0.5s ease 0.4s both' : 'none',
          }}>
            메인 비주얼의 일관성과 페이지 진입 카피의 명확성이 가장 컸어요.{' '}
            <span style={{ color: '#cffafe' }}>Research notes.md</span> 12-18주차 노트에서 측정값 확인할 수 있습니다.
          </div>

          {/* AI feedback */}
          <div style={{
            borderRadius: 12, padding: '10px 14px',
            border: '1px solid rgba(167,139,250,0.18)', background: 'rgba(11,16,32,0.85)',
            animation: active ? 'slide-up 0.5s ease 0.75s both' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <Sparkles size={12} style={{ color: '#fde68a' }} />
              <p style={{ margin: 0, fontSize: 10.5, color: '#fde68a', fontWeight: 600 }}>피드백</p>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>
              근거 인용은 명확합니다.{' '}
              <strong style={{ color: '#fff' }}>대안 비교가 부족</strong>해요 — "왜 A/B 테스트가 아닌 이 결정?"에 대한 노트를 추가하면 점수가 올라갑니다.
            </p>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <MockPill tone="emerald" size="sm" icon={<ShieldCheck size={10} />}>Research notes.md</MockPill>
              <MockPill tone="emerald" size="sm" icon={<ShieldCheck size={10} />}>Brand system.pdf</MockPill>
            </div>
          </div>
        </div>

        {/* Score column */}
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <div style={{
            borderRadius: 14, padding: 16,
            border: '1px solid rgba(110,231,183,0.20)',
            background: 'linear-gradient(160deg, rgba(110,231,183,0.10), rgba(11,16,32,0.85) 60%)',
          }}>
            <MockEyebrow color="#a7f3d0" tracking="0.22em">Overall score</MockEyebrow>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <p style={{ margin: 0, fontSize: 40, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>79</p>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>/ 100</p>
              <span style={{ marginLeft: 'auto' }}><MockPill tone="emerald" size="sm">제출 가능</MockPill></span>
            </div>
          </div>

          <div style={{
            borderRadius: 14, padding: 14,
            border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(11,16,32,0.85)',
          }}>
            <MockEyebrow color="#94a3b8" tracking="0.22em">Rubric</MockEyebrow>
            <div style={{ marginTop: 8, display: 'grid', gap: 7 }}>
              {rubric.map((r, i) => (
                <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={{ width: 70, color: '#cbd5e1' }}>{r.k}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{
                      width: active ? `${r.v}%` : '0%', height: '100%',
                      background: r.tone === 'emerald'
                        ? 'linear-gradient(90deg,#6ee7b7,#a7f3d0)'
                        : 'linear-gradient(90deg,#fcd34d,#fde68a)',
                      transition: `width 1.4s var(--ease-spring) ${0.4 + i * 0.12}s`,
                    }} />
                  </div>
                  <span style={{ width: 30, textAlign: 'right', color: '#fff', fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 11 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
