import { CheckCircle2, Copy, ExternalLink, Eye, Globe2, Link2, Share2, Sparkles } from 'lucide-react'
import { MockBtn, MockEyebrow, MockPill } from './mockup-primitives'

export function LandingZoomShare({ active }: { active: boolean }) {
  return (
    <div style={{
      position: 'relative', width: 'min(460px, 100%)', margin: '0 auto',
      borderRadius: 22, padding: '28px 26px 24px',
      border: '1px solid rgba(110,231,183,0.28)',
      background: 'linear-gradient(140deg, rgba(110,231,183,0.16), rgba(11,16,32,0.95) 55%)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 56px rgba(110,231,183,0.18)',
      animation: active ? 'spring-in 0.55s var(--ease-spring) both' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 44, height: 44, borderRadius: 13, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(110,231,183,0.20)', color: '#a7f3d0',
        }}>
          <Globe2 size={22} />
        </span>
        <div>
          <MockEyebrow color="#a7f3d0" tracking="0.24em">Live</MockEyebrow>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            포트폴리오가 공개되었습니다
          </p>
        </div>
      </div>

      <p style={{ margin: '14px 0 0', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
        누구나 링크로 작품을 보고, AI Guide에게 질문할 수 있어요.
      </p>

      <div style={{
        marginTop: 18, display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.4)',
      }}>
        <Link2 size={16} style={{ color: '#a5f3fc', flexShrink: 0 }} />
        <p style={{
          margin: 0, flex: 1, fontSize: 13.5,
          fontFamily: 'SFMono-Regular, Consolas, monospace',
          color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          foliosage.com/p/9k7m2-launch
        </p>
        <MockBtn variant="outline" size="sm" icon={<Copy size={12} />}>복사</MockBtn>
      </div>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MockBtn variant="primary" size="md" icon={<ExternalLink size={14} />} fullWidth>라이브 페이지</MockBtn>
        <MockBtn variant="outline" size="md" icon={<Share2 size={14} />} fullWidth>공유</MockBtn>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <MockPill tone="emerald" size="md" icon={<CheckCircle2 size={11} />}>18 verified</MockPill>
        <MockPill tone="violet"  size="md" icon={<Sparkles size={11} />}>AI Guide</MockPill>
        <MockPill tone="cyan"    size="md" icon={<Eye size={11} />}>SEO 자동</MockPill>
      </div>
    </div>
  )
}
