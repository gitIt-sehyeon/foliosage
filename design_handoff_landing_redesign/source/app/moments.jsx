// Moments — replacement for ScrollStory. 7 viewport-scale sections that
// alternate big product hero moments with focused component close-ups.
// Each moment is its own section. No sticky-column crowding.

const useRevealStrong = (opts = {}) => {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { setVisible(true); io.unobserve(e.target); }
      });
    }, { threshold: opts.threshold ?? 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
};

// ─── Copy block — used inside every moment ───
const MomentCopy = ({ n, tag, title, body, align = 'left', narrow = false, vibe }) => (
  <div style={{ maxWidth: narrow ? 460 : 620, textAlign: align }}>
    <div style={{
      display:'inline-flex', alignItems:'center', gap:12,
      marginBottom:18,
    }}>
      <span style={{
        fontFamily:'var(--fs-font-mono)', fontSize:13, letterSpacing:'0.12em',
        color:'#a78bfa',
      }}>{n}</span>
      <span style={{ width:32, height:1, background:'#a78bfa' }} />
      <Pill tone="violet" size="md">{tag}</Pill>
    </div>
    <h3 style={{
      margin:0,
      fontSize: vibe === 'experimental' ? 'clamp(34px, 4.2vw, 60px)' : 'clamp(30px, 3.6vw, 52px)',
      fontWeight:600, lineHeight:1.04, letterSpacing:'-0.025em', color:'#fff',
    }}>{title}</h3>
    <p style={{
      margin:'20px 0 0',
      fontSize: vibe === 'bold' || vibe === 'experimental' ? 18 : 17,
      color:'#94a3b8', lineHeight:1.65,
    }}>{body}</p>
  </div>
);

// ─── Aurora halo behind mockups ───
const Halo = ({ color = 'violet', size = 'lg' }) => {
  const palettes = {
    violet:  'conic-gradient(from 140deg, rgba(124,58,237,0.28), rgba(20,184,166,0.20), rgba(245,158,11,0.14), rgba(124,58,237,0.28))',
    cyan:    'conic-gradient(from 220deg, rgba(34,211,238,0.24), rgba(124,58,237,0.22), rgba(110,231,183,0.16), rgba(34,211,238,0.24))',
    emerald: 'conic-gradient(from 60deg, rgba(110,231,183,0.24), rgba(34,211,238,0.18), rgba(167,139,250,0.16), rgba(110,231,183,0.24))',
    amber:   'conic-gradient(from 100deg, rgba(245,158,11,0.20), rgba(167,139,250,0.20), rgba(34,211,238,0.18), rgba(245,158,11,0.20))',
  };
  const blur = size === 'sm' ? 60 : size === 'md' ? 80 : 100;
  return (
    <div aria-hidden style={{
      position:'absolute', inset:-50, borderRadius:'50%',
      background: palettes[color],
      filter:`blur(${blur}px)`, opacity:0.65, pointerEvents:'none', zIndex:0,
    }} />
  );
};

// ─── Hero moment — copy on top, big mockup below ───
const MomentHero = ({ n, tag, title, body, MockEl, color = 'violet', frameLabel, align = 'left', vibe }) => {
  const [ref, visible] = useRevealStrong({ threshold: 0.15 });
  return (
    <section ref={ref} style={{
      position:'relative', zIndex:2, padding:'14vh 32px',
      minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center',
      maxWidth:1280, margin:'0 auto',
    }}>
      <div style={{
        display:'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition:'opacity 0.7s, transform 0.7s',
        marginBottom:48,
      }}>
        <MomentCopy n={n} tag={tag} title={title} body={body} align={align} vibe={vibe} />
      </div>
      <div style={{
        position:'relative', width:'100%', maxWidth:1100, margin:'0 auto',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
        transition:'opacity 0.8s 0.15s, transform 0.9s 0.15s var(--fs-ease-spring)',
      }}>
        <Halo color={color} size="lg" />
        <div style={{ position:'relative', zIndex:1 }}>
          <FrameChrome label={frameLabel} pill={<Pill tone="violet" size="sm">{n}</Pill>}>
            {MockEl}
          </FrameChrome>
        </div>
      </div>
    </section>
  );
};

// ─── Zoom moment — smaller close-up paired with copy ───
const MomentZoom = ({ n, tag, title, body, ZoomEl, color = 'emerald', reverse = false, vibe }) => {
  const [ref, visible] = useRevealStrong({ threshold: 0.2 });
  return (
    <section ref={ref} style={{
      position:'relative', zIndex:2, padding:'12vh 32px',
      minHeight:'90vh', display:'flex', alignItems:'center',
      maxWidth:1280, margin:'0 auto',
    }}>
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center',
        width:'100%',
      }}>
        <div style={{
          order: reverse ? 2 : 1,
          opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : `translateX(${reverse ? 30 : -30}px)`,
          transition:'opacity 0.7s, transform 0.7s',
        }}>
          <MomentCopy n={n} tag={tag} title={title} body={body} align="left" narrow vibe={vibe} />
        </div>
        <div style={{
          order: reverse ? 1 : 2, position:'relative',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.94)',
          transition:'opacity 0.8s 0.15s, transform 0.9s 0.15s var(--fs-ease-spring)',
        }}>
          <Halo color={color} size="md" />
          <div style={{ position:'relative', zIndex:1 }}>
            {ZoomEl}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Section divider — eyebrow that introduces the journey ───
const MomentsIntro = ({ vibe }) => {
  const [ref, visible] = useRevealStrong({ threshold: 0.3 });
  return (
    <section ref={ref} style={{
      position:'relative', zIndex:2,
      maxWidth:1280, margin:'0 auto', padding:'10vh 32px 4vh',
    }}>
      <div style={{
        maxWidth:880,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition:'opacity 0.7s, transform 0.7s',
      }}>
        <Eyebrow tracking="0.28em">How it works · 7 moments</Eyebrow>
        <h2 style={{
          margin:'14px 0 0',
          fontSize: vibe === 'bold' || vibe === 'experimental' ? 'clamp(40px, 5.2vw, 76px)' : 'clamp(36px, 4.6vw, 68px)',
          fontWeight:600, lineHeight:1.02, letterSpacing:'-0.028em', color:'#fff',
        }}>
          업로드부터 면접까지,<br />
          <span style={{
            background:'linear-gradient(120deg, #a78bfa, #67e8f9 60%, #fde68a)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            fontStyle: vibe === 'experimental' ? 'italic' : 'normal',
          }}>일곱 장면.</span>
        </h2>
        <p style={{ margin:'20px 0 0', fontSize:17, color:'#94a3b8', lineHeight:1.65, maxWidth:680 }}>
          전체 과정의 가장 강한 순간들. 실제 화면이 그대로 보입니다 — 작품이 어떻게 살아나는지.
        </p>
      </div>
    </section>
  );
};

// ─── The 7 moments composed ───
const Moments = ({ vibe }) => (
  <>
    <MomentsIntro vibe={vibe} />

    {/* H1 — Upload + Organize (combined) */}
    <MomentHero
      n="01" tag="Upload + Organize"
      title="파일을 던지면, 의미로 묶입니다."
      body="기획서·이미지·코드·PDF·압축 어떤 것이든. VaultSage가 시스템 / 비주얼 / 문서 / 아카이브로 자동 분류하고, 모든 파일을 SHA-256 해시로 인증합니다."
      MockEl={<MockOrganize active />}
      frameLabel="foliosage.app / smart-organizer"
      color="violet"
      vibe={vibe}
    />

    {/* Z1 — Certificate */}
    <MomentZoom
      n="02" tag="Creation certificate"
      title="한 파일, 한 인증서."
      body={<span>업로드되는 순간 SHA-256 해시 + 타임스탬프로 봉인됩니다. 면접 5년 후에도 “이건 언제 만들었나요?”에 정확히 답할 수 있어요.</span>}
      ZoomEl={<ZoomCertificate active />}
      color="emerald"
      vibe={vibe}
    />

    {/* H2 — Story generation */}
    <MomentHero
      n="03" tag="Generate Story"
      title="Summary · Role · Problem · Solution · Impact."
      body="Generate Story를 누르면 핵심 5섹션이 자동으로 채워집니다. Evidence Highlights와 예상 면접 질문도 함께. AI 초안 + 당신의 최종 통제."
      MockEl={<MockStory active />}
      frameLabel="foliosage.app / portfolio / story"
      color="cyan"
      vibe={vibe}
    />

    {/* Z2 — Readiness */}
    <MomentZoom
      n="04" tag="Readiness"
      title="제출 가능한 상태인가요?"
      body="Story · Evidence · AI Review · Public Link 네 가지가 한 점수로 보입니다. 무엇이 부족한지 한 줄로 — 면접 직전, 확신을 갖고 보내세요."
      ZoomEl={<ZoomReadiness active />}
      color="violet"
      reverse
      vibe={vibe}
    />

    {/* H3 — AI Review */}
    <MomentHero
      n="05" tag="AI Portfolio Review"
      title="단순 챗봇이 아닙니다. 업로드한 파일을 근거로 채점합니다."
      body="AI가 면접 질문을 던지고 당신의 답변을 평가합니다. 부족한 근거와 인용 가능한 파일을 함께 알려줘요. Defense Room에서 미리 단련하세요."
      MockEl={<MockReview active />}
      frameLabel="foliosage.app / defense-room"
      color="amber"
      align="right"
      vibe={vibe}
    />

    {/* Z3 — Share */}
    <MomentZoom
      n="06" tag="Live link"
      title="한 줄의 링크. 살아있는 페이지."
      body="공개로 전환하면 /p/<code>로 즉시 라이브. 검증된 파일, AI Guide, 인용 가능한 증거가 한 페이지에. SEO 메타도 자동으로."
      ZoomEl={<ZoomShare active />}
      color="emerald"
      vibe={vibe}
    />

    {/* H4 — Visitor + AI Chat */}
    <MomentHero
      n="07" tag="Visitor · AI Guide"
      title="방문자는 묻고, 작품이 답합니다."
      body="정리된 스토리와 파일 그리드. 우측의 AI Guide가 18개 파일을 근거로 어떤 질문에도 답합니다. 인용된 원본 파일까지 함께."
      MockEl={<MockVisitor active />}
      frameLabel="foliosage.com / p / 9k7m2-launch"
      color="cyan"
      vibe={vibe}
    />
  </>
);

Object.assign(window, { Moments });
