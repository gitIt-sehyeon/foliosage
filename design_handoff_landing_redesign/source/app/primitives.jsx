// Shared UI primitives — Pill, Btn, Eyebrow, Card, FrameChrome, AppNavbar,
// reveal-on-scroll hook. Kept tight; the mockups consume these.

// ─── useReveal: IntersectionObserver wrapper for fade-in-on-scroll ───
const useReveal = (opts = {}) => {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisible(true);
          if (opts.once !== false) io.unobserve(e.target);
        } else if (opts.once === false) {
          setVisible(false);
        }
      });
    }, { threshold: opts.threshold ?? 0.18, rootMargin: opts.rootMargin ?? '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
};

// ─── useScrollProgress: 0..1 progress through a section, for parallax/cross-fade ───
const useScrollProgress = () => {
  const ref = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 when section bottom touches viewport bottom, 1 when section top reaches viewport top
      const total = rect.height - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return [ref, progress];
};

// ─── Pill — status / category badge ───
const Pill = ({ children, tone = 'neutral', dot, icon, size = 'md', style }) => {
  const tones = {
    neutral:  { bg:'rgba(255,255,255,0.04)', bd:'rgba(255,255,255,0.10)', fg:'#94a3b8', glow:'rgba(255,255,255,0)' },
    emerald:  { bg:'rgba(110,231,183,0.08)', bd:'rgba(110,231,183,0.22)', fg:'#a7f3d0', glow:'rgba(110,231,183,0.7)' },
    amber:    { bg:'rgba(252,211,77,0.07)',  bd:'rgba(252,211,77,0.22)',  fg:'#fde68a', glow:'rgba(252,211,77,0.6)' },
    cyan:     { bg:'rgba(103,232,249,0.08)', bd:'rgba(103,232,249,0.22)', fg:'#a5f3fc', glow:'rgba(103,232,249,0.6)' },
    violet:   { bg:'rgba(167,139,250,0.08)', bd:'rgba(167,139,250,0.24)', fg:'#ddd6fe', glow:'rgba(167,139,250,0.7)' },
    rose:     { bg:'rgba(248,113,113,0.08)', bd:'rgba(248,113,113,0.22)', fg:'#fecaca', glow:'rgba(248,113,113,0.5)' },
  }[tone] || {};
  const sizes = { sm: { pad:'2px 8px', fs:10, gap:4 }, md:{ pad:'4px 10px', fs:11, gap:6 } }[size];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:sizes.gap,
      padding:sizes.pad, borderRadius:9999,
      background:tones.bg, border:`1px solid ${tones.bd}`, color:tones.fg,
      fontSize:sizes.fs, fontWeight:500, whiteSpace:'nowrap', letterSpacing:0.01,
      ...style,
    }}>
      {dot && <span style={{ width:6, height:6, borderRadius:9999, background:tones.fg, boxShadow:`0 0 12px ${tones.glow}` }} />}
      {icon}
      {children}
    </span>
  );
};

// ─── Eyebrow — uppercase label ───
const Eyebrow = ({ children, color = 'var(--fs-cyan-300)', tracking = '0.26em', style }) => (
  <p style={{ margin:0, fontSize:11, fontWeight:500, letterSpacing:tracking, textTransform:'uppercase', color, ...style }}>
    {children}
  </p>
);

// ─── Btn ───
const Btn = ({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, type, disabled, style, fullWidth }) => {
  const variants = {
    primary:   { bg:'#6d28d9', color:'#fff', bd:'rgba(196,181,253,0.20)', glow:'0 0 28px rgba(124,58,237,0.32)', hover:'#7c3aed' },
    secondary: { bg:'#fff',    color:'#020617', bd:'transparent',         glow:'none',                            hover:'#cffafe' },
    outline:   { bg:'rgba(255,255,255,0.03)', color:'#e2e8f0', bd:'rgba(255,255,255,0.12)', glow:'none', hover:'rgba(255,255,255,0.07)' },
    ghost:     { bg:'transparent', color:'#cbd5e1', bd:'transparent', glow:'none', hover:'rgba(255,255,255,0.05)' },
  }[variant];
  const sz = { sm:{ h:32, px:12, fs:12 }, md:{ h:40, px:16, fs:13 }, lg:{ h:48, px:22, fs:14 }, xl:{ h:56, px:28, fs:15 } }[size];
  const [hover, setHover] = React.useState(false);
  return (
    <button type={type || 'button'} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height:sz.h, padding:`0 ${sz.px}px`, fontSize:sz.fs, fontWeight:600,
        borderRadius:10, border:`1px solid ${variants.bd}`,
        background: hover && !disabled ? variants.hover : variants.bg, color:variants.color,
        boxShadow:variants.glow, display: fullWidth ? 'flex' : 'inline-flex',
        alignItems:'center', justifyContent:'center', gap:8, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition:'background-color 0.15s, transform 0.05s',
        whiteSpace:'nowrap', fontFamily:'inherit', width: fullWidth ? '100%' : undefined, ...style,
      }}>
      {icon}{children}{iconRight}
    </button>
  );
};

// ─── Card ───
const Card = ({ children, style, padded = true, tinted = false, glow = false, onClick }) => (
  <div onClick={onClick} style={{
    borderRadius:18,
    border:'1px solid rgba(255,255,255,0.10)',
    background: tinted ? 'rgba(167,139,250,0.07)' : 'rgba(11,16,32,0.90)',
    backdropFilter:'blur(20px)',
    boxShadow: glow ? '0 24px 64px rgba(0,0,0,0.40), 0 0 32px rgba(124,58,237,0.18)' : '0 16px 40px rgba(0,0,0,0.30)',
    padding: padded ? 24 : 0,
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }}>{children}</div>
);

// ─── FrameChrome — a fake macOS window frame around mockups ───
const FrameChrome = ({ children, label, pill, style }) => (
  <div style={{
    borderRadius:18, overflow:'hidden',
    border:'1px solid rgba(255,255,255,0.10)',
    background:'rgba(11,16,32,0.92)',
    boxShadow:'0 24px 80px rgba(0,0,0,0.55), 0 0 40px rgba(124,58,237,0.10)',
    backdropFilter:'blur(20px)',
    ...style,
  }}>
    <div style={{
      height:40, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 14px', borderBottom:'1px solid rgba(255,255,255,0.08)',
      background:'rgba(255,255,255,0.02)',
    }}>
      <div style={{ display:'flex', gap:7 }}>
        <span style={{ width:10, height:10, borderRadius:9999, background:'rgba(248,113,113,0.7)' }} />
        <span style={{ width:10, height:10, borderRadius:9999, background:'rgba(252,211,77,0.7)' }} />
        <span style={{ width:10, height:10, borderRadius:9999, background:'rgba(110,231,183,0.7)' }} />
      </div>
      {label && (
        <span style={{ fontSize:11, color:'#64748b', fontFamily:'var(--fs-font-mono)', letterSpacing:0.02 }}>{label}</span>
      )}
      {pill || <span />}
    </div>
    <div>{children}</div>
  </div>
);

// ─── AppNavbar — the navbar inside product mockups ───
const AppNavbar = ({ right, compact = true }) => (
  <div style={{
    height: compact ? 48 : 60, padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
    borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(7,11,21,0.72)',
  }}>
    <FolioLogo size={compact ? 22 : 26} />
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>{right}</div>
  </div>
);

// ─── Stat tile ───
const StatTile = ({ value, label, icon, tone = 'cyan', style }) => {
  const tones = {
    cyan:    { bd:'rgba(103,232,249,0.18)', bg:'rgba(103,232,249,0.04)', fg:'#a5f3fc' },
    violet:  { bd:'rgba(167,139,250,0.18)', bg:'rgba(167,139,250,0.04)', fg:'#c4b5fd' },
    amber:   { bd:'rgba(252,211,77,0.18)',  bg:'rgba(252,211,77,0.04)',  fg:'#fde68a' },
    emerald: { bd:'rgba(110,231,183,0.18)', bg:'rgba(110,231,183,0.04)', fg:'#a7f3d0' },
  }[tone];
  return (
    <div style={{ borderRadius:14, border:`1px solid ${tones.bd}`, background:tones.bg, padding:16, ...style }}>
      <span style={{ color:tones.fg, display:'inline-block' }}>{icon}</span>
      <p style={{ margin:'14px 0 0', fontSize:26, fontWeight:600, color:'#fff', letterSpacing:'-0.02em' }}>{value}</p>
      <p style={{ margin:'4px 0 0', fontSize:11, color:'#64748b' }}>{label}</p>
    </div>
  );
};

Object.assign(window, {
  useReveal, useScrollProgress,
  Pill, Eyebrow, Btn, Card, FrameChrome, AppNavbar, StatTile,
});
