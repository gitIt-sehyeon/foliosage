// Landing page sections — Gallery (example portfolios), FinalCTA, Footer.

// ─── Gallery — example portfolios as bento-style cards ───
const Gallery = ({ vibe }) => {
  const [ref, visible] = useReveal({ once: true });
  const portfolios = [
    {
      tag:'Brand · Campaign',
      author:'민준 김',
      role:'Lead designer',
      title:'Launch Campaign Portfolio',
      desc:'9주의 스프린트로 봄 2026 캠페인 시각 시스템 구축. 18개 검증된 파일.',
      stats:[['Files', '18'], ['AI 응답', '342'], ['Views', '1.2k']],
      mesh:'linear-gradient(135deg, #1e1b4b, #0b1020 60%, #0f172a)',
      blob: ['rgba(167,139,250,0.55)', 'rgba(34,211,238,0.40)', 'rgba(245,158,11,0.35)'],
      pills:[ ['emerald','18 verified'], ['violet','AI reviewed'], ['cyan','Live'] ],
    },
    {
      tag:'Product · UX',
      author:'서연 박',
      role:'Product designer',
      title:'Mobile Onboarding Study',
      desc:'5가지 가설을 A/B 테스트로 검증. 사용자 인터뷰 노트 22개 인용.',
      stats:[['Files', '11'], ['AI 응답', '128'], ['Views', '844']],
      mesh:'linear-gradient(135deg, #0c4a6e, #0b1020 55%, #075985)',
      blob: ['rgba(34,211,238,0.50)', 'rgba(167,139,250,0.30)', 'rgba(110,231,183,0.30)'],
      pills:[ ['emerald','11 verified'], ['violet','AI reviewed'] ],
    },
    {
      tag:'Frontend · System',
      author:'지호 이',
      role:'Frontend engineer',
      title:'Editorial Site — Components',
      desc:'42개 컴포넌트, 12개 디자인 토큰. 코드 + 디자인 결정 노트.',
      stats:[['Files', '32'], ['AI 응답', '210'], ['Views', '564']],
      mesh:'linear-gradient(135deg, #052e2b, #0b1020 60%, #064e3b)',
      blob: ['rgba(110,231,183,0.50)', 'rgba(34,211,238,0.35)', 'rgba(252,211,77,0.25)'],
      pills:[ ['emerald','32 verified'], ['cyan','Public'] ],
    },
  ];
  return (
    <section ref={ref} style={{
      position:'relative', zIndex:2, maxWidth:1280, margin:'0 auto', padding:'80px 32px 80px',
    }}>
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24, marginBottom:32,
        flexWrap:'wrap',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition:'opacity 0.6s, transform 0.6s',
      }}>
        <div style={{ maxWidth:680 }}>
          <Eyebrow tracking="0.28em">Examples · Live portfolios</Eyebrow>
          <h2 style={{
            margin:'12px 0 0',
            fontSize: vibe === 'bold' || vibe === 'experimental' ? 'clamp(36px, 4.5vw, 64px)' : 'clamp(32px, 3.8vw, 56px)',
            fontWeight:600, lineHeight:1.05, letterSpacing:'-0.022em', color:'#fff',
          }}>
            이렇게 살아있어요.
          </h2>
          <p style={{ margin:'14px 0 0', fontSize:15, color:'#94a3b8', lineHeight:1.6, maxWidth:540 }}>
            실제 FolioSage 사용자들의 포트폴리오. 각 카드는 라이브 페이지로 연결됩니다.
          </p>
        </div>
        <Btn variant="outline" size="md" iconRight={<ArrowUpRight size={14} />}>전체 갤러리 보기</Btn>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:14 }}>
        {portfolios.map((p, i) => (
          <article key={p.title} style={{
            borderRadius:18, overflow:'hidden',
            border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(11,16,32,0.85)', backdropFilter:'blur(16px)',
            display:'flex', flexDirection:'column',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)',
            transition:`opacity 0.6s ${0.15 + i*0.1}s, transform 0.7s ${0.15 + i*0.1}s, border-color 0.25s, transform 0.3s`,
            cursor:'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            {/* Cover */}
            <div style={{
              position:'relative', height:200, overflow:'hidden',
              background:`radial-gradient(circle at 25% 30%, ${p.blob[0]}, transparent 50%),`+
                          `radial-gradient(circle at 80% 65%, ${p.blob[1]}, transparent 55%),`+
                          `radial-gradient(circle at 60% 20%, ${p.blob[2]}, transparent 45%),`+
                          p.mesh,
            }}>
              <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6, flexWrap:'wrap' }}>
                {p.pills.map(([tone, label]) => (
                  <Pill key={label} tone={tone} size="sm" icon={tone === 'emerald' ? <ShieldCheck size={9} /> : tone === 'violet' ? <Sparkles size={9} /> : null}>{label}</Pill>
                ))}
              </div>
              <div style={{ position:'absolute', bottom:12, right:12,
                fontFamily:'var(--fs-font-mono)', fontSize:10, color:'rgba(255,255,255,0.55)',
                background:'rgba(11,16,32,0.6)', padding:'3px 8px', borderRadius:9999,
                backdropFilter:'blur(6px)' }}>
                /p/{p.title.toLowerCase().match(/[a-z]+/g)?.[0] || 'live'}
              </div>
            </div>
            {/* Body */}
            <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>
              <div>
                <Eyebrow color="#a5f3fc" tracking="0.22em">{p.tag}</Eyebrow>
                <h3 style={{ margin:'8px 0 0', fontSize:18, fontWeight:600, color:'#fff', letterSpacing:'-0.012em', lineHeight:1.25 }}>{p.title}</h3>
                <p style={{ margin:'8px 0 0', fontSize:13, color:'#94a3b8', lineHeight:1.55 }}>{p.desc}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:28, height:28, borderRadius:9999,
                  background:'linear-gradient(135deg, #7c3aed, #22d3ee)' }} />
                <div>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#e2e8f0' }}>{p.author}</p>
                  <p style={{ margin:0, fontSize:10.5, color:'#64748b' }}>{p.role}</p>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8,
                paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                {p.stats.map(([l, v]) => (
                  <div key={l}>
                    <p style={{ margin:0, fontSize:14, fontWeight:600, color:'#fff', letterSpacing:'-0.01em' }}>{v}</p>
                    <p style={{ margin:0, fontSize:10, color:'#64748b' }}>{l}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'auto', display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:'#c4b5fd' }}>
                라이브 페이지 열기 <ArrowUpRight size={13} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

// ─── Final CTA ───
const FinalCTA = ({ vibe }) => {
  const [ref, visible] = useReveal({ once: true });
  const bold = vibe === 'bold' || vibe === 'experimental';
  return (
    <section ref={ref} style={{
      position:'relative', zIndex:2, maxWidth:1280, margin:'0 auto', padding:'56px 32px 80px',
    }}>
      <div style={{
        position:'relative', overflow:'hidden',
        borderRadius:28, padding:'72px 48px 64px',
        border:'1px solid rgba(167,139,250,0.22)',
        background:'radial-gradient(ellipse at 30% 30%, rgba(124,58,237,0.36), transparent 55%),'+
                   'radial-gradient(ellipse at 80% 70%, rgba(34,211,238,0.18), transparent 60%),'+
                   'linear-gradient(135deg, rgba(15,23,42,0.5), rgba(6,9,18,0.95) 60%)',
        textAlign:'center',
        opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.96)',
        transition:'opacity 0.7s, transform 0.7s var(--fs-ease-spring)',
      }}>
        {/* aurora */}
        <div aria-hidden style={{
          position:'absolute', inset:0,
          background:'conic-gradient(from 140deg at 50% 50%, transparent, rgba(167,139,250,0.16), transparent, rgba(103,232,249,0.12), transparent)',
          filter:'blur(60px)', opacity:0.7,
        }} />
        {/* grid */}
        <div aria-hidden style={{
          position:'absolute', inset:0, pointerEvents:'none', opacity:0.4,
          backgroundImage:'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),'+
                          'linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize:'44px 44px',
        }} />
        <div style={{ position:'relative' }}>
          <Pill tone="cyan" dot style={{ fontSize:12 }}>Free during beta · 5분 안에 첫 포트폴리오</Pill>
          <h2 style={{
            margin:'24px 0 0',
            fontSize: bold ? 'clamp(48px, 7vw, 116px)' : 'clamp(42px, 6vw, 96px)',
            fontWeight: bold ? 700 : 600, lineHeight:0.95, letterSpacing:'-0.035em', color:'#fff',
            maxWidth:1000, margin:'24px auto 0',
          }}>
            지금 가진 파일이<br />
            <span style={{
              background:'linear-gradient(120deg, #a78bfa 0%, #67e8f9 50%, #fde68a 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              fontStyle: vibe === 'experimental' ? 'italic' : 'normal',
            }}>당신의 다음 합격이 됩니다.</span>
          </h2>
          <p style={{ margin:'24px auto 0', maxWidth:580, fontSize:16, color:'#cbd5e1', lineHeight:1.6 }}>
            업로드 → 자동 정리 → AI 가이드 → 공개 링크. 한 시간이면 끝나요.
          </p>
          <div style={{ marginTop:36, display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <Btn variant="primary" size={bold ? 'xl' : 'lg'} iconRight={<ArrowRight size={16} />}>지금 시작하기</Btn>
            <Btn variant="outline" size={bold ? 'xl' : 'lg'} icon={<Globe2 size={16} />}>샘플 페이지 보기</Btn>
          </div>
          <div style={{ marginTop:32, display:'flex', justifyContent:'center', gap:24, fontSize:12, color:'#64748b', flexWrap:'wrap' }}>
            {[
              ['신용카드 불필요'],
              ['1GB 무료 저장'],
              ['SHA-256 인증'],
              ['모든 파일 암호화'],
            ].map(([t]) => (
              <span key={t} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                <CheckCircle2 size={12} style={{ color:'#6ee7b7' }} /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───
const Footer = () => (
  <footer style={{
    position:'relative', zIndex:2, maxWidth:1280, margin:'0 auto',
    padding:'24px 32px 56px',
    borderTop:'1px solid rgba(255,255,255,0.06)',
    display:'flex', justifyContent:'space-between', alignItems:'center', gap:24, flexWrap:'wrap',
  }}>
    <div style={{ display:'flex', alignItems:'center', gap:18 }}>
      <FolioLogo size={22} />
      <span style={{ fontSize:11, color:'#64748b' }}>당신의 포트폴리오가 말을 겁니다.</span>
    </div>
    <div style={{ display:'flex', gap:24, fontSize:12, color:'#64748b' }}>
      <a href="#" style={{ color:'inherit', textDecoration:'none' }}>가이드</a>
      <a href="#" style={{ color:'inherit', textDecoration:'none' }}>가격</a>
      <a href="#" style={{ color:'inherit', textDecoration:'none' }}>회사 소개</a>
      <a href="#" style={{ color:'inherit', textDecoration:'none' }}>개인정보</a>
    </div>
    <p style={{ margin:0, fontSize:11, color:'#475569' }}>© 2026 FolioSage</p>
  </footer>
);

Object.assign(window, { Gallery, FinalCTA, Footer });
