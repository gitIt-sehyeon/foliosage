// Landing page sections — Hero, ScrollStory, Capabilities, Gallery,
// FinalCTA, Footer. Each section composes the mockups and primitives
// shared via window globals.

// ─── Hero ───
const Hero = ({ vibe }) => {
  const [ref, visible] = useReveal({ once: true });
  const bold = vibe === 'bold' || vibe === 'experimental';
  const expt = vibe === 'experimental';
  return (
    <section ref={ref} style={{
      position:'relative', zIndex:2,
      maxWidth:1280, margin:'0 auto', padding:'40px 32px 56px',
    }}>
      <div style={{ maxWidth:980 }}>
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition:'opacity 0.6s, transform 0.6s',
        }}>
          <Pill tone="cyan" dot>
            작업 파일 → 인증된 포트폴리오 → AI 가이드
          </Pill>
        </div>
        <h1 style={{
          margin:'22px 0 0',
          fontSize: expt ? 'clamp(56px, 9vw, 156px)' : bold ? 'clamp(52px, 8vw, 128px)' : 'clamp(48px, 7vw, 104px)',
          fontWeight: bold ? 700 : 600,
          lineHeight: 0.92, letterSpacing:'-0.035em',
          color:'#fff',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition:'opacity 0.7s 0.05s, transform 0.7s 0.05s',
        }}>
          <span style={{ display:'block' }}>포트폴리오에게</span>
          <span style={{
            display:'block',
            background:'linear-gradient(120deg, #a78bfa 0%, #ffffff 35%, #67e8f9 70%, #a78bfa 100%)',
            backgroundSize:'200% auto',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            color:'transparent',
            animation:'fs-shimmer 4s linear infinite',
            fontStyle: expt ? 'italic' : 'normal',
          }}>물어보세요.</span>
        </h1>
        <p style={{
          margin:'28px 0 0', maxWidth:600,
          fontSize: bold ? 19 : 17, lineHeight:1.55, color:'#cbd5e1',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition:'opacity 0.7s 0.15s, transform 0.7s 0.15s',
        }}>
          업로드한 프로젝트 파일을 AI가 정리해 면접에서 통하는 이야기로 만들어줍니다.
          모든 파일은 해시로 인증되고, 방문자는 작품에 직접 질문할 수 있어요.
        </p>
        <div style={{
          marginTop:32, display:'flex', gap:10, flexWrap:'wrap',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition:'opacity 0.7s 0.25s, transform 0.7s 0.25s',
        }}>
          <Btn variant="primary" size={bold ? 'xl' : 'lg'} iconRight={<ArrowRight size={16} />}>
            포트폴리오 만들기
          </Btn>
          <Btn variant="outline" size={bold ? 'xl' : 'lg'} icon={<PlayCircle size={16} />}>
            데모 둘러보기
          </Btn>
        </div>
        {/* Down indicator */}
        <div style={{
          marginTop:52, display:'inline-flex', alignItems:'center', gap:10,
          fontSize:11, color:'#64748b', letterSpacing:'0.24em', textTransform:'uppercase',
          opacity: visible ? 1 : 0,
          transition:'opacity 0.6s 0.6s',
        }}>
          <span style={{ display:'inline-flex', width:30, height:30, borderRadius:9999,
            border:'1px solid rgba(255,255,255,0.10)',
            alignItems:'center', justifyContent:'center', color:'#a5f3fc',
            animation:'fs-float 3.5s ease-in-out infinite' }}>
            <ArrowDown size={12} />
          </span>
          스크롤해서 어떻게 사용하는지 보기
        </div>
      </div>
    </section>
  );
};

// ─── ScrollStory ─── sticky mockup + scrolling narrative
const STORY_STEPS = [
  {
    n:'01', tag:'대시보드',
    title:'작업의 시작 — 워크스페이스.',
    body:'업로드한 프로젝트와 진행 상태를 한 곳에서. 새 포트폴리오는 한 번의 클릭으로 시작합니다.',
    Mock: 'MockDashboard',
  },
  {
    n:'02', tag:'새 포트폴리오',
    title:'결과물이 아니라, 과정 전체.',
    body:'제목과 짧은 설명만 입력하면 끝. 이후 업로드되는 모든 파일은 “과정의 증거”로 묶입니다.',
    Mock: 'MockCreate',
  },
  {
    n:'03', tag:'파일 업로드',
    title:'한 파일, 한 인증서.',
    body:'기획서, 발표자료, 이미지, 코드, 압축까지. 업로드되는 순간 SHA-256 해시와 타임스탬프로 봉인됩니다.',
    Mock: 'MockUpload',
  },
  {
    n:'04', tag:'AI 자동 정리',
    title:'VaultSage Smart Organizer.',
    body:'파일이 의미별로 묶입니다 — 시스템, 비주얼, 문서, 아카이브. 면접관이 “근거 파일?”이라 물으면 바로 가리킬 수 있어요.',
    Mock: 'MockOrganize',
  },
  {
    n:'05', tag:'Story 자동 생성',
    title:'Summary · Role · Problem · Solution · Impact.',
    body:'Generate Story를 누르면 핵심 5섹션이 자동으로 채워집니다. Evidence Highlights와 예상 면접 질문도 같이.',
    Mock: 'MockStory',
  },
  {
    n:'06', tag:'Readiness 체크',
    title:'제출 가능한 상태인가요?',
    body:'Story · Evidence · AI Review · Public Link의 4가지가 준비 점수로 보입니다. 무엇이 부족한지 한 줄로.',
    Mock: 'MockReadiness',
  },
  {
    n:'07', tag:'AI Portfolio Review',
    title:'단순 챗봇이 아닙니다. 실제 파일을 근거로 리뷰합니다.',
    body:'AI가 면접 질문을 던지고, 당신의 답변을 채점합니다. 부족한 근거와 인용 가능한 파일을 함께 알려줘요.',
    Mock: 'MockReview',
  },
  {
    n:'08', tag:'공개 링크',
    title:'한 줄의 링크. 살아있는 페이지.',
    body:'공개로 전환하면 /p/<code>로 즉시 라이브. 검증된 파일, AI Guide, 인용 가능한 증거가 한 페이지에.',
    Mock: 'MockPublish',
  },
  {
    n:'09', tag:'방문자 페이지',
    title:'방문자는 읽고, 본다 — 그리고 묻는다.',
    body:'정리된 스토리와 파일 그리드. 오른쪽 AI Guide가 18개 파일을 근거로 어떤 질문에도 답합니다.',
    Mock: 'MockVisitor',
  },
  {
    n:'10', tag:'통계 + 인증서',
    title:'면접 후에도 살아있는 포트폴리오.',
    body:'누가 무엇을 봤는지, 무엇이 다운로드됐는지. 모든 파일에 발급된 인증서는 사라지지 않습니다.',
    Mock: 'MockStats',
  },
];

const ScrollStory = ({ vibe }) => {
  const [active, setActive] = React.useState(0);
  const stepRefs = React.useRef([]);
  const lineRef = React.useRef(null);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      // pick the entry closest to center of viewport
      let best = null, bestDist = Infinity;
      entries.forEach(e => {
        const r = e.target.getBoundingClientRect();
        const center = r.top + r.height/2;
        const vh = window.innerHeight;
        const dist = Math.abs(center - vh/2);
        if (e.isIntersecting && dist < bestDist) {
          bestDist = dist;
          best = e.target;
        }
      });
      if (best) setActive(Number(best.dataset.idx));
    }, { threshold: [0.4, 0.5, 0.6], rootMargin: '-30% 0px -30% 0px' });
    stepRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Section header reveal
  const [headRef, headVisible] = useReveal({ once: true });

  return (
    <section ref={containerRef} style={{
      position:'relative', zIndex:2,
      maxWidth:1280, margin:'0 auto', padding:'40px 32px 80px',
    }}>
      {/* Section heading */}
      <div ref={headRef} style={{
        maxWidth:880, margin:'0 0 56px',
        opacity: headVisible ? 1 : 0, transform: headVisible ? 'translateY(0)' : 'translateY(20px)',
        transition:'opacity 0.6s, transform 0.6s',
      }}>
        <Eyebrow tracking="0.28em">How it works · 10 steps</Eyebrow>
        <h2 style={{
          margin:'14px 0 0',
          fontSize: vibe === 'bold' || vibe === 'experimental' ? 'clamp(40px, 5vw, 72px)' : 'clamp(36px, 4.4vw, 64px)',
          fontWeight:600, lineHeight:1.02, letterSpacing:'-0.025em', color:'#fff',
        }}>
          업로드부터 면접까지,<br/>
          <span style={{
            background:'linear-gradient(120deg, #a78bfa, #67e8f9 60%, #fde68a)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            fontStyle: vibe === 'experimental' ? 'italic' : 'normal',
          }}>스크롤로 따라가세요.</span>
        </h2>
        <p style={{ margin:'18px 0 0', fontSize:16, color:'#94a3b8', lineHeight:1.6, maxWidth:680 }}>
          실제 제품 화면을 그대로 보여드립니다. 어떻게 사용하는지, 어떤 모습으로 살아있는지.
        </p>
      </div>

      {/* Sticky-stage layout */}
      <div style={{
        display:'grid', gridTemplateColumns:'minmax(0, 1.05fr) minmax(0, 1fr)',
        gap:48,
      }}>
        {/* LEFT WRAPPER — grid stretches this to match RIGHT column height,
            giving the sticky child a tall containing block to stick within */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'sticky', top:'8vh', height:'84vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'relative', width:'100%', maxWidth:680, aspectRatio:'4 / 3' }}>
            {/* aurora behind frame */}
            <div aria-hidden style={{
              position:'absolute', inset:-30, borderRadius:36,
              background:'conic-gradient(from 140deg, rgba(124,58,237,0.20), rgba(20,184,166,0.18), rgba(245,158,11,0.12), rgba(124,58,237,0.20))',
              filter:'blur(56px)', opacity:0.85,
              transition:'opacity 0.6s',
            }} />
            {/* progress dots */}
            <div ref={lineRef} style={{
              position:'absolute', left:-30, top:0, bottom:0, width:2,
              background:'rgba(255,255,255,0.06)', borderRadius:2,
            }}>
              <div style={{
                width:'100%',
                height: `${((active+1) / STORY_STEPS.length) * 100}%`,
                background:'linear-gradient(180deg, #a78bfa, #22d3ee, #fde68a)',
                borderRadius:2,
                transition:'height 0.5s var(--fs-ease)',
              }} />
            </div>
            {/* dot marks on the line */}
            {STORY_STEPS.map((_, i) => (
              <div key={i} style={{
                position:'absolute', left:-37, top:`${(i / (STORY_STEPS.length - 1)) * 100}%`,
                transform:'translateY(-50%)', width:16, height:16, borderRadius:9999,
                background: i <= active ? '#a78bfa' : '#0b1020',
                border:'2px solid ' + (i <= active ? '#fff' : 'rgba(255,255,255,0.20)'),
                transition:'all 0.4s var(--fs-ease)',
                boxShadow: i === active ? '0 0 20px rgba(167,139,250,0.8)' : 'none',
              }} />
            ))}
            {/* Mockup stack — crossfade */}
            <div style={{ position:'absolute', inset:0 }}>
              {STORY_STEPS.map((step, i) => {
                const M = window[step.Mock];
                const isActive = i === active;
                return (
                  <div key={i} style={{
                    position:'absolute', inset:0,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(20px)',
                    transition:'opacity 0.55s var(--fs-ease), transform 0.6s var(--fs-ease-spring)',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}>
                    <FrameChrome
                      label={`foliosage.app / ${step.tag.replace(/\s+/g,'-').toLowerCase()}`}
                      pill={<Pill tone="violet" size="sm">{step.n}</Pill>}
                      style={{ height:'100%' }}>
                      {M ? <M active={isActive} /> : <div style={{ height:480, background:'#0b1020' }} />}
                    </FrameChrome>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* RIGHT — scrolling narrative */}
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {STORY_STEPS.map((step, i) => (
            <div key={i} data-idx={i}
              ref={el => (stepRefs.current[i] = el)}
              style={{
                minHeight:'88vh', display:'flex', alignItems:'center',
                padding:'10vh 0',
              }}>
              <div style={{
                opacity: i === active ? 1 : 0.32,
                transform: i === active ? 'translateY(0)' : 'translateY(0)',
                transition:'opacity 0.5s var(--fs-ease), transform 0.5s var(--fs-ease)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                  <span style={{
                    fontFamily:'var(--fs-font-mono)', fontSize:13, letterSpacing:'0.12em',
                    color: i === active ? '#a78bfa' : '#475569',
                    transition:'color 0.4s',
                  }}>{step.n}</span>
                  <span style={{ width:32, height:1, background: i === active ? '#a78bfa' : 'rgba(255,255,255,0.10)', transition:'background 0.4s' }} />
                  <Pill tone={i === active ? 'violet' : 'neutral'} size="md">{step.tag}</Pill>
                </div>
                <h3 style={{
                  margin:0,
                  fontSize: vibe === 'experimental' ? 'clamp(32px, 3.6vw, 52px)' : 'clamp(28px, 3.2vw, 44px)',
                  fontWeight:600, lineHeight:1.05, letterSpacing:'-0.022em',
                  color: i === active ? '#fff' : '#cbd5e1',
                  transition:'color 0.4s',
                }}>{step.title}</h3>
                <p style={{
                  margin:'18px 0 0',
                  fontSize: vibe === 'bold' || vibe === 'experimental' ? 17 : 16,
                  color:'#94a3b8', lineHeight:1.65, maxWidth:520,
                }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Capabilities strip ───
const Capabilities = ({ vibe }) => {
  const [ref, visible] = useReveal({ once: true });
  const caps = [
    { Icon:Files, t:'자동 정리된 아카이브', d:'프로젝트, 보조 파일, 노트를 의미별로 묶어 깔끔한 포트폴리오 구조로.', tone:'violet' },
    { Icon:MessageSquareText, t:'방문자용 AI 채팅', d:'방문자가 역할 · 프로세스 · 파일 · 결과를 직접 물어볼 수 있어요.', tone:'cyan' },
    { Icon:Fingerprint, t:'모든 파일에 증명', d:'타임스탬프 해시 인증서가 자동으로 붙습니다. 위·변조 방지.', tone:'amber' },
    { Icon:ShieldCheck, t:'검증된 출처 인용', d:'AI 답변은 항상 인용한 원본 파일을 함께 표시합니다.', tone:'emerald' },
  ];
  const toneFg = { violet:'#c4b5fd', cyan:'#a5f3fc', amber:'#fde68a', emerald:'#a7f3d0' };
  return (
    <section ref={ref} style={{
      position:'relative', zIndex:2, maxWidth:1280, margin:'0 auto', padding:'80px 32px 56px',
    }}>
      <div style={{ marginBottom:32 }}>
        <Eyebrow tracking="0.28em">왜 FolioSage 인가</Eyebrow>
        <h2 style={{
          margin:'12px 0 0',
          fontSize: vibe === 'bold' || vibe === 'experimental' ? 'clamp(32px, 4vw, 56px)' : 'clamp(28px, 3.4vw, 48px)',
          fontWeight:600, lineHeight:1.05, letterSpacing:'-0.022em', color:'#fff',
          maxWidth:760,
        }}>
          단순한 갤러리가 아닙니다. <br />
          <span style={{
            background:'linear-gradient(120deg, #a78bfa, #67e8f9)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>증거 기반의 포트폴리오 OS.</span>
        </h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:14 }}>
        {caps.map((c, i) => (
          <div key={c.t} style={{
            borderRadius:16, padding:'22px 20px',
            border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(11,16,32,0.7)', backdropFilter:'blur(20px)',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition:`opacity 0.6s ${0.1 + i*0.08}s, transform 0.6s ${0.1 + i*0.08}s, border-color 0.2s, background 0.2s`,
            cursor:'default',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.40)'; e.currentTarget.style.background = 'rgba(11,16,32,0.92)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(11,16,32,0.7)'; }}
          >
            <span style={{ color:toneFg[c.tone], display:'inline-block', marginBottom:24 }}>
              <c.Icon size={22} />
            </span>
            <p style={{ margin:0, fontSize:15, fontWeight:600, color:'#fff', letterSpacing:'-0.01em' }}>{c.t}</p>
            <p style={{ margin:'8px 0 0', fontSize:13, color:'#94a3b8', lineHeight:1.6 }}>{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

Object.assign(window, { Hero, ScrollStory, STORY_STEPS, Capabilities });
