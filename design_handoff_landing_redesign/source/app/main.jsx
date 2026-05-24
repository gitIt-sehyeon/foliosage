// Main App — wires the Stage, top nav, all landing sections, and Tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "vibe": "bold",
  "background": "aurora",
  "gridLines": true,
  "primary": "#7c3aed",
  "accent": "violet-cyan-amber"
}/*EDITMODE-END*/;

// ─── TopNav (always visible) ───
const TopNav = ({ vibe }) => (
  <nav style={{
    position:'sticky', top:0, zIndex:50,
    background:'rgba(6,9,18,0.72)', backdropFilter:'blur(24px)',
    borderBottom:'1px solid rgba(255,255,255,0.05)',
  }}>
    <div style={{
      maxWidth:1280, margin:'0 auto', padding:'14px 32px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <FolioLogo size={28} />
      <div style={{ display:'none', alignItems:'center', gap:24, fontSize:13, color:'#94a3b8' }} className="fs-nav-links">
        <a href="#how" style={{ color:'inherit', textDecoration:'none' }}>사용 방법</a>
        <a href="#examples" style={{ color:'inherit', textDecoration:'none' }}>예시</a>
        <a href="#pricing" style={{ color:'inherit', textDecoration:'none' }}>가격</a>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <Btn variant="ghost" size="sm">로그인</Btn>
        <Btn variant="primary" size="sm" iconRight={<ArrowRight size={12} />}>시작하기</Btn>
      </div>
    </div>
  </nav>
);

// ─── Stage background — grid + aurora + vignette ───
const StageBg = ({ gridLines, background }) => (
  <>
    {gridLines && (
      <div aria-hidden style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:'linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px),'+
                        'linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)',
        backgroundSize:'44px 44px',
      }} />
    )}
    {background !== 'none' && (
      <div aria-hidden style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        background: background === 'aurora'
          ? 'radial-gradient(circle at 18% 14%, rgba(124,58,237,0.28), transparent 30%),'+
            'radial-gradient(circle at 84% 22%, rgba(34,211,238,0.18), transparent 28%),'+
            'radial-gradient(circle at 56% 88%, rgba(245,158,11,0.12), transparent 26%)'
          : 'radial-gradient(circle at 30% 0%, rgba(124,58,237,0.20), transparent 50%)',
        animation: background === 'aurora' ? 'fs-aurora 18s ease infinite' : 'none',
      }} />
    )}
    <div aria-hidden style={{
      position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
      background:'linear-gradient(180deg, rgba(6,9,18,0) 0%, rgba(6,9,18,0.4) 60%, rgba(6,9,18,0.92) 100%)',
    }} />
  </>
);

// ─── App ───
const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <div style={{
      position:'relative', minHeight:'100vh', background:'#060912',
      color:'#fff', fontFamily:'var(--fs-font-sans)',
    }}>
      <StageBg gridLines={t.gridLines} background={t.background} />
      <TopNav vibe={t.vibe} />
      <Hero vibe={t.vibe} />
      <section id="how"><Moments vibe={t.vibe} /></section>
      <Capabilities vibe={t.vibe} />
      <section id="examples"><Gallery vibe={t.vibe} /></section>
      <FinalCTA vibe={t.vibe} />
      <Footer />

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="Vibe" />
        <TweakRadio label="Tone" value={t.vibe} options={['calm','bold','experimental']}
          onChange={(v) => setTweak('vibe', v)} />
        <TweakSection label="Background" />
        <TweakRadio label="Layer" value={t.background} options={['aurora','simple','none']}
          onChange={(v) => setTweak('background', v)} />
        <TweakToggle label="Grid lines" value={t.gridLines}
          onChange={(v) => setTweak('gridLines', v)} />
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
