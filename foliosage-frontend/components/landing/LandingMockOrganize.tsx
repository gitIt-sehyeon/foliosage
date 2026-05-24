import { Archive, CheckCircle2, FileText, Image as ImageIcon, Layers, Sparkles, Wand2 } from 'lucide-react'
import { MockAppNavbar, MockEyebrow, MockPill, MONO_FONT } from './mockup-primitives'

export function LandingMockOrganize({ active }: { active: boolean }) {
  const cats = [
    { label: '시스템',   icon: <Layers size={14} />,   tone: '#c4b5fd', bg: 'rgba(167,139,250,0.10)', files: ['Brand system.pdf', 'Color tokens.json'] },
    { label: '비주얼',   icon: <ImageIcon size={14} />, tone: '#cffafe', bg: 'rgba(103,232,249,0.10)', files: ['Hero key visual.png', 'Concept board.jpg', 'Microsite hifi.fig'] },
    { label: '문서',     icon: <FileText size={14} />,  tone: '#fde68a', bg: 'rgba(252,211,77,0.10)',  files: ['Process journal.md', 'Research notes.md'] },
    { label: '아카이브', icon: <Archive size={14} />,   tone: '#a7f3d0', bg: 'rgba(110,231,183,0.10)', files: ['Final delivery.zip'] },
  ]

  return (
    <div style={{ background: '#070b15', minHeight: 480 }}>
      <MockAppNavbar right={<MockPill tone="violet" size="sm" dot>AI 정리 중</MockPill>} />
      <div style={{ padding: '18px 22px' }}>
        {/* Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14,
          border: '1px solid rgba(167,139,250,0.25)',
          background: 'linear-gradient(120deg, rgba(124,58,237,0.20), rgba(34,211,238,0.10) 70%)',
        }}>
          <span style={{
            width: 44, height: 44, borderRadius: 12, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(167,139,250,0.18)', color: '#fff',
            boxShadow: '0 0 32px rgba(124,58,237,0.40)',
            animation: active ? 'glow-pulse 2.5s ease-in-out infinite' : 'none',
          }}>
            <Wand2 size={20} />
          </span>
          <div style={{ flex: 1 }}>
            <MockEyebrow color="#c4b5fd" tracking="0.22em">VaultSage Smart Organizer</MockEyebrow>
            <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: '#fff' }}>18개 파일을 프로젝트 근거 구조로 분류 중</p>
          </div>
          <MockPill tone="cyan" size="sm" icon={<Sparkles size={10} />}>78%</MockPill>
        </div>

        {/* Categories */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {cats.map((c, i) => (
            <div key={c.label} style={{
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(11,16,32,0.85)', padding: 12,
              animation: active ? `spring-in 0.6s var(--ease-spring) ${0.2 + i * 0.12}s both` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 7, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', background: c.bg, color: c.tone,
                }}>
                  {c.icon}
                </span>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#fff' }}>{c.label}</p>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#64748b' }}>{c.files.length}개</span>
              </div>
              <div style={{ display: 'grid', gap: 5 }}>
                {c.files.map((f, fi) => (
                  <div key={f} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 8px', borderRadius: 7,
                    background: 'rgba(255,255,255,0.025)',
                    fontSize: 11, color: '#cbd5e1',
                    animation: active ? `slide-up 0.4s ease ${0.5 + i * 0.12 + fi * 0.08}s both` : 'none',
                  }}>
                    <span style={{ color: '#6ee7b7' }}><CheckCircle2 size={11} /></span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: '#64748b', textAlign: 'center' }}>
          모든 파일은 의미별로 묶이며, 인용 가능한 "근거" 단위가 됩니다.
        </div>
      </div>
    </div>
  )
}
