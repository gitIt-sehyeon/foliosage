// Zoom-in component close-ups — designed to be SHOWN BIG, not stuffed into a tiny frame.
// Each is one product element blown up so the user can read every label.

// ─── ZOOM 1: Creation certificate badge close-up ───
const ZoomCertificate = ({ active }) => (
  <div style={{
    position:'relative', width:'min(420px, 100%)', margin:'0 auto',
    borderRadius:22, padding:'28px 26px 26px',
    border:'1px solid rgba(110,231,183,0.30)',
    background:'linear-gradient(160deg, rgba(110,231,183,0.18), rgba(11,16,32,0.95) 60%)',
    boxShadow:'0 30px 80px rgba(0,0,0,0.55), 0 0 56px rgba(110,231,183,0.20)',
  }}>
    {/* shine */}
    <div aria-hidden style={{
      position:'absolute', inset:0, borderRadius:22, pointerEvents:'none',
      background:'radial-gradient(circle at 100% 0%, rgba(110,231,183,0.30), transparent 50%)',
    }} />
    <div style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <span style={{ width:44, height:44, borderRadius:12, display:'inline-flex',
          alignItems:'center', justifyContent:'center',
          background:'rgba(110,231,183,0.22)', color:'#a7f3d0',
          boxShadow:'0 0 30px rgba(110,231,183,0.40)',
          animation: active ? 'fs-glow-pulse 2.5s ease-in-out infinite' : 'none' }}>
          <Award size={22} />
        </span>
        <div>
          <Eyebrow color="#a7f3d0" tracking="0.24em">Creation certificate</Eyebrow>
          <p style={{ margin:'4px 0 0', fontSize:11, color:'#94a3b8' }}>fs:proof:v1 · 위·변조 방지</p>
        </div>
      </div>
      <p style={{ margin:0, fontSize:20, fontWeight:600, color:'#fff', lineHeight:1.3, letterSpacing:'-0.01em' }}>
        Brand system.pdf
      </p>
      <p style={{ margin:'4px 0 18px', fontSize:12, color:'#94a3b8' }}>
        해시 + 타임스탬프 + 작성자 서명 — 면접 5년 후에도 증명됩니다.
      </p>
      <div style={{
        padding:'14px 16px', borderRadius:12,
        background:'rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.06)',
        fontFamily:'var(--fs-font-mono)', fontSize:12, lineHeight:1.9, color:'#cbd5e1',
      }}>
        {[
          ['hash',  'SHA-256',  'a3f9c2b1ce5d…', '#a7f3d0'],
          ['at',    'created',  '2026-04-12T14:08:21Z', '#cffafe'],
          ['size',  'bytes',    '4,247,168', '#fde68a'],
          ['by',    'creator',  'minjoonkim', '#ddd6fe'],
          ['sig',   'verified', '✓ FolioSage', '#a7f3d0'],
        ].map(([k, lbl, v, color], i) => (
          <div key={k} style={{
            display:'flex', gap:10, alignItems:'baseline',
            animation: active ? `fs-slide-up 0.4s ease ${0.15 + i*0.12}s both` : 'none',
          }}>
            <span style={{ width:40, color:'#475569' }}>{k}</span>
            <span style={{ width:70, color:'#64748b' }}>{lbl}</span>
            <span style={{ color, flex:1 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop:14, display:'flex', gap:6, flexWrap:'wrap' }}>
        <Pill tone="emerald" size="md" icon={<ShieldCheck size={11} />}>Verified</Pill>
        <Pill tone="cyan" size="md" icon={<Fingerprint size={11} />}>Public proof</Pill>
        <Pill tone="violet" size="md" icon={<Sparkles size={11} />}>Inline citation</Pill>
      </div>
    </div>
  </div>
);

// ─── ZOOM 2: Readiness gauge close-up ───
const ZoomReadiness = ({ active }) => {
  const score = 87;
  const checks = [
    { l:'Story 작성',       d:'4/4 섹션',     ok:true },
    { l:'Evidence 연결',    d:'18개 인증됨',   ok:true },
    { l:'AI Review 통과',   d:'점수 79/100',  ok:true },
    { l:'Public Link 발급', d:'대기 중',       ok:false },
  ];
  return (
    <div style={{
      position:'relative', width:'min(440px, 100%)', margin:'0 auto',
      borderRadius:22, padding:'28px 28px 24px',
      border:'1px solid rgba(167,139,250,0.25)',
      background:'linear-gradient(160deg, rgba(124,58,237,0.22), rgba(11,16,32,0.95) 65%)',
      boxShadow:'0 30px 80px rgba(0,0,0,0.55), 0 0 56px rgba(124,58,237,0.20)',
    }}>
      <Eyebrow color="#c4b5fd" tracking="0.24em">Readiness · 제출 준비도</Eyebrow>
      <div style={{ display:'flex', alignItems:'center', gap:24, marginTop:14 }}>
        {/* Gauge */}
        <div style={{ position:'relative', width:148, height:148, flexShrink:0 }}>
          <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%' }}>
            <defs>
              <linearGradient id="zoom-readiness-gauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="60%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="42" stroke="url(#zoom-readiness-gauge)" strokeWidth="8" fill="none"
              strokeLinecap="round" pathLength="100"
              strokeDasharray={`${active ? score : 0} 100`}
              style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dasharray 2s var(--fs-ease)' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <p style={{ margin:0, fontSize:42, fontWeight:600, color:'#fff', letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums' }}>{score}</p>
            <p style={{ margin:'-4px 0 0', fontSize:11, color:'#94a3b8', letterSpacing:'0.06em' }}>/ 100</p>
          </div>
        </div>
        {/* Right blurb */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:0, fontSize:14, fontWeight:600, color:'#fff' }}>
            제출 가능
          </p>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#94a3b8', lineHeight:1.55 }}>
            공개 링크만 발급하면 끝. AI Guide도 학습 완료.
          </p>
          <div style={{ marginTop:10, display:'flex', gap:5, flexWrap:'wrap' }}>
            <Pill tone="emerald" size="sm">Story</Pill>
            <Pill tone="emerald" size="sm">Evidence</Pill>
            <Pill tone="emerald" size="sm">AI</Pill>
            <Pill tone="amber" size="sm">Link</Pill>
          </div>
        </div>
      </div>
      <div style={{ marginTop:18, display:'grid', gap:6 }}>
        {checks.map((c, i) => (
          <div key={c.l} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'10px 12px', borderRadius:11,
            border:'1px solid ' + (c.ok ? 'rgba(110,231,183,0.18)' : 'rgba(252,211,77,0.16)'),
            background: c.ok ? 'rgba(110,231,183,0.04)' : 'rgba(252,211,77,0.04)',
            animation: active ? `fs-slide-up 0.4s ease ${0.2 + i*0.08}s both` : 'none',
          }}>
            <span style={{ color: c.ok ? '#6ee7b7' : '#fcd34d' }}>
              {c.ok ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </span>
            <p style={{ margin:0, flex:1, fontSize:13, fontWeight:500, color:'#fff' }}>{c.l}</p>
            <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ZOOM 3: Share / publish link close-up ───
const ZoomShare = ({ active }) => (
  <div style={{
    position:'relative', width:'min(460px, 100%)', margin:'0 auto',
    borderRadius:22, padding:'28px 26px 24px',
    border:'1px solid rgba(110,231,183,0.28)',
    background:'linear-gradient(140deg, rgba(110,231,183,0.16), rgba(11,16,32,0.95) 55%)',
    boxShadow:'0 30px 80px rgba(0,0,0,0.55), 0 0 56px rgba(110,231,183,0.18)',
    animation: active ? 'fs-spring-in 0.55s var(--fs-ease-spring) both' : 'none',
  }}>
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <span style={{ width:44, height:44, borderRadius:13, display:'inline-flex',
        alignItems:'center', justifyContent:'center',
        background:'rgba(110,231,183,0.20)', color:'#a7f3d0' }}>
        <Globe2 size={22} />
      </span>
      <div>
        <Eyebrow color="#a7f3d0" tracking="0.24em">Live</Eyebrow>
        <p style={{ margin:'4px 0 0', fontSize:18, fontWeight:600, color:'#fff', letterSpacing:'-0.01em' }}>
          포트폴리오가 공개되었습니다
        </p>
      </div>
    </div>
    <p style={{ margin:'14px 0 0', fontSize:13, color:'#94a3b8', lineHeight:1.6 }}>
      누구나 링크로 작품을 보고, AI Guide에게 질문할 수 있어요.
    </p>
    <div style={{
      marginTop:18, display:'flex', alignItems:'center', gap:10,
      padding:'12px 14px', borderRadius:12,
      border:'1px solid rgba(255,255,255,0.10)', background:'rgba(0,0,0,0.4)',
    }}>
      <Link2 size={16} style={{ color:'#a5f3fc', flexShrink:0 }} />
      <p style={{ margin:0, flex:1, fontSize:13.5, fontFamily:'var(--fs-font-mono)', color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        foliosage.com/p/9k7m2-launch
      </p>
      <Btn variant="outline" size="sm" icon={<Copy size={12} />}>복사</Btn>
    </div>
    <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      <Btn variant="primary" size="md" icon={<ExternalLink size={14} />} fullWidth>라이브 페이지</Btn>
      <Btn variant="outline" size="md" icon={<Share2 size={14} />} fullWidth>공유</Btn>
    </div>
    <div style={{ marginTop:16, display:'flex', gap:6, flexWrap:'wrap' }}>
      <Pill tone="emerald" size="md" icon={<CheckCircle2 size={11} />}>18 verified</Pill>
      <Pill tone="violet" size="md" icon={<Sparkles size={11} />}>AI Guide</Pill>
      <Pill tone="cyan" size="md" icon={<Eye size={11} />}>SEO 자동</Pill>
    </div>
  </div>
);

Object.assign(window, { ZoomCertificate, ZoomReadiness, ZoomShare });
