import { CheckCircle2, FileCheck2, Heart, Palette, Send, Sparkles } from 'lucide-react'
import { MockEyebrow, MockLogoMark, MockPill, MONO_FONT } from './mockup-primitives'

export function LandingMockVisitor({ active }: { active: boolean }) {
  return (
    <div style={{ background: '#070b15', minHeight: 480 }}>
      {/* Visitor chrome bar */}
      <div style={{
        height: 42, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,11,21,0.88)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MockLogoMark />
          <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.10)' }} />
          <span style={{ fontSize: 10.5, color: '#64748b', letterSpacing: '0.18em', textTransform: 'uppercase' }}>방문자 화면 · 민준</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <MockPill tone="emerald" size="sm" icon={<CheckCircle2 size={10} />}>FolioSage 검증</MockPill>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 9px',
            borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', fontSize: 10,
          }}>
            <Heart size={10} /> 24
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', minHeight: 438 }}>
        {/* Story column */}
        <article style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <MockPill tone="violet" size="sm" dot>Live · 2026.05.06</MockPill>
            <MockPill tone="cyan" size="sm" icon={<Sparkles size={10} />}>AI reviewed</MockPill>
          </div>
          <h1 style={{
            margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 0.98,
            background: 'linear-gradient(120deg, #fff 0%, #ddd6fe 50%, #67e8f9 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: active ? 'slide-up 0.6s ease both' : 'none',
          }}>
            Launch<br />Campaign<br />
            <span style={{
              background: 'linear-gradient(120deg, #f59e0b 0%, #ec4899 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic',
            }}>Portfolio.</span>
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.6, maxWidth: 380 }}>
            9주의 스프린트로 봄 2026 캠페인의 시각 시스템을 구축. 네이밍, 아트 디렉션, 자산 파이프라인, 런칭 마이크로사이트.
          </p>

          {/* Hero image placeholder */}
          <div style={{
            marginTop: 14, height: 86, borderRadius: 14, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            background:
              'radial-gradient(circle at 25% 30%, rgba(167,139,250,0.55), transparent 50%),' +
              'radial-gradient(circle at 80% 65%, rgba(34,211,238,0.40), transparent 55%),' +
              'radial-gradient(circle at 60% 20%, rgba(245,158,11,0.35), transparent 45%),' +
              'linear-gradient(135deg, #1e1b4b, #0b1020 60%, #0f172a)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', left: 12, bottom: 10, padding: '3px 8px', borderRadius: 9999,
              background: 'rgba(11,16,32,0.7)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.10)', fontSize: 9.5, color: '#cbd5e1',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Palette size={10} style={{ color: '#fde68a' }} /> Hero key visual · concept_v3.png
            </div>
          </div>

          {/* File bento mini */}
          <div style={{ marginTop: 10, display: 'grid', gap: 6, gridTemplateColumns: '2fr 1fr 1fr', gridAutoRows: '56px' }}>
            {[
              { t: 'Brand system',   e: 'pdf',  tone: '#ddd6fe', bg: 'rgba(167,139,250,0.10)' },
              { t: 'Color tokens',   e: 'json', tone: '#a7f3d0', bg: 'rgba(110,231,183,0.10)' },
              { t: 'Process journal', e: 'md',  tone: '#fde68a', bg: 'rgba(252,211,77,0.10)'  },
            ].map(f => (
              <div key={f.t} style={{
                borderRadius: 10, padding: 9, border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(11,16,32,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', background: f.bg, color: f.tone,
                }}>
                  <FileCheck2 size={12} />
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#fff' }}>{f.t}</p>
                  <p style={{ margin: 0, fontSize: 9, color: '#475569', fontFamily: MONO_FONT }}>.{f.e}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* AI chat aside */}
        <aside style={{
          borderLeft: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,11,21,0.88)',
          padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(167,139,250,0.12)', color: '#c4b5fd',
            }}>
              <Sparkles size={14} />
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#fff' }}>AI Guide</p>
              <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>18개 파일에서 답변</p>
            </div>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: '#6ee7b7', boxShadow: '0 0 12px #6ee7b7' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div style={{
              alignSelf: 'flex-end', padding: '7px 10px', borderRadius: 10, borderBottomRightRadius: 3,
              background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff',
              fontSize: 10.5, lineHeight: 1.45, maxWidth: '90%',
              animation: active ? 'slide-up 0.4s ease 0.2s both' : 'none',
            }}>
              가장 강한 증거 파일 3개?
            </div>
            <div style={{
              alignSelf: 'flex-start', padding: '8px 11px', borderRadius: 10, borderBottomLeftRadius: 3,
              border: '1px solid rgba(167,139,250,0.20)',
              background: 'linear-gradient(140deg, rgba(167,139,250,0.10), rgba(34,211,238,0.04))',
              color: '#e2e8f0', fontSize: 10.5, lineHeight: 1.55, maxWidth: '92%',
              animation: active ? 'answer-reveal 1s ease 0.6s both' : 'none',
            }}>
              Brand system PDF, Campaign stills, Research notes — 세 파일이 시각 시스템·산출물 품질·의사결정의 근거를 보여줍니다.
            </div>
            <div style={{
              display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2,
              animation: active ? 'slide-up 0.4s ease 1.5s both' : 'none',
            }}>
              {['Brand system.pdf', 'Campaign stills.zip', 'Research notes.md'].map(s => (
                <MockPill key={s} tone="emerald" size="sm" icon={<CheckCircle2 size={9} />}>{s}</MockPill>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 6, padding: '6px 8px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ flex: 1, fontSize: 10.5, color: '#64748b', display: 'flex', alignItems: 'center' }}>무엇이든 물어보세요</span>
            <span style={{
              width: 24, height: 24, borderRadius: 7, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              background: '#6d28d9', color: '#fff',
            }}>
              <Send size={11} />
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}
