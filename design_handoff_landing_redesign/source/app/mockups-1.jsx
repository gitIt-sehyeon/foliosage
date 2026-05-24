// Mock product screens — steps 1..5 of the FolioSage flow.
// Each mockup is a self-contained component ~480px tall, designed to live
// inside a FrameChrome at ~720-780px wide. Receives `active` (bool) so
// internal animations can replay when the parent flips us in.

// ─── Step 1: Dashboard / Workspace overview ───
const MockDashboard = ({ active }) => {
  const portfolios = [
    { t:'Launch Campaign Portfolio',  pub:true,  story:true,  ai:true,  files:18, date:'2026.04.12' },
    { t:'Spring 2025 Brand System',   pub:true,  story:true,  ai:false, files:24, date:'2026.03.08' },
    { t:'Editorial Site — Concept',   pub:false, story:false, ai:false, files: 7, date:'2026.02.20' },
    { t:'Mobile Onboarding Study',    pub:false, story:true,  ai:true,  files:11, date:'2026.02.01' },
  ];
  return (
    <div style={{ background:'#070b15', minHeight:480 }}>
      <AppNavbar right={<>
        <Btn variant="outline" size="sm" icon={<ExternalLink size={12} />}>내 프로필</Btn>
        <Btn variant="secondary" size="sm" icon={<Plus size={12} />}>새 포트폴리오</Btn>
      </>} />
      <div style={{ padding:'20px 22px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
          {/* Hero card */}
          <div style={{ borderRadius:14, border:'1px solid rgba(255,255,255,0.10)', background:'rgba(11,16,32,0.92)', padding:'18px 20px' }}>
            <Eyebrow>Workspace overview</Eyebrow>
            <h2 style={{ margin:'8px 0 4px', fontSize:24, fontWeight:600, color:'#fff', letterSpacing:'-0.01em' }}>민준의 포트폴리오</h2>
            <p style={{ margin:0, fontSize:12, color:'#94a3b8', lineHeight:1.55 }}>
              프로젝트 파일을 업로드해 면접에서 바로 설명할 수 있는 증거 포트폴리오로.
            </p>
            <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[['포트폴리오','12','#c4b5fd'], ['공개 중','7','#a7f3d0'], ['파일','146','#a5f3fc']].map(([l,v,c]) => (
                <div key={l} style={{ borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.025)', padding:'10px 12px' }}>
                  <p style={{ margin:0, fontSize:18, fontWeight:600, color:'#fff' }}>{v}</p>
                  <p style={{ margin:0, fontSize:10, color:'#64748b' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Side card */}
          <div style={{ borderRadius:14, border:'1px solid rgba(167,139,250,0.20)',
            background:'linear-gradient(160deg, rgba(124,58,237,0.20), rgba(11,16,32,0.85) 70%)',
            padding:16, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div>
              <Eyebrow color="#c4b5fd" tracking="0.22em">시작하기</Eyebrow>
              <p style={{ margin:'8px 0 0', fontSize:13, fontWeight:600, color:'#fff', lineHeight:1.4 }}>새 포트폴리오 만들기</p>
              <p style={{ margin:'4px 0 0', fontSize:11, color:'#94a3b8', lineHeight:1.5 }}>제목만 정하면 시작합니다.</p>
            </div>
            <Btn variant="primary" size="sm" icon={<Plus size={12} />} fullWidth
              style={{ marginTop:12, animation: active ? 'fs-glow-pulse 2.5s ease-in-out infinite' : 'none' }}>
              만들기
            </Btn>
          </div>
        </div>
        {/* Portfolio grid */}
        <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
          {portfolios.map((p,i) => (
            <div key={p.t} style={{
              borderRadius:12, border:'1px solid rgba(255,255,255,0.08)',
              background:'rgba(11,16,32,0.85)', padding:14,
              animation: active ? `fs-slide-up 0.5s ease ${0.1 + i*0.08}s both` : 'none',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <span style={{ display:'inline-flex', width:32, height:32, borderRadius:9,
                  background:'rgba(167,139,250,0.10)', color:'#c4b5fd', alignItems:'center', justifyContent:'center' }}>
                  <BriefcaseBusiness size={14} />
                </span>
                <Pill tone={p.pub ? 'emerald' : 'neutral'} dot size="sm">{p.pub ? '공개' : '비공개'}</Pill>
              </div>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#fff', lineHeight:1.3 }}>{p.t}</p>
              <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
                {p.story && <Pill tone="emerald" size="sm">Story</Pill>}
                {p.ai && <Pill tone="violet" size="sm">AI reviewed</Pill>}
                <Pill tone="neutral" size="sm">{p.files} files</Pill>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: New Portfolio creation ───
const MockCreate = ({ active }) => (
  <div style={{ background:'#070b15', minHeight:480, position:'relative', overflow:'hidden' }}>
    <AppNavbar />
    {/* dimmed bg */}
    <div style={{ padding:'20px 22px', filter:'blur(2px)', opacity:0.4 }}>
      <div style={{ height:60, borderRadius:12, background:'rgba(255,255,255,0.04)', marginBottom:10 }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ height:90, borderRadius:12, background:'rgba(255,255,255,0.04)' }} />)}
      </div>
    </div>
    {/* modal */}
    <div style={{
      position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(6,9,18,0.65)', backdropFilter:'blur(8px)',
    }}>
      <div style={{
        width:'min(560px, 92%)', borderRadius:16,
        border:'1px solid rgba(167,139,250,0.25)',
        background:'linear-gradient(160deg, rgba(124,58,237,0.18), rgba(11,16,32,0.95) 60%)',
        padding:22, boxShadow:'0 30px 80px rgba(0,0,0,0.55), 0 0 40px rgba(124,58,237,0.20)',
        animation: active ? 'fs-spring-in 0.5s var(--fs-ease-spring) both' : 'none',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <span style={{ width:32, height:32, borderRadius:10, display:'inline-flex',
            alignItems:'center', justifyContent:'center',
            background:'rgba(167,139,250,0.10)', color:'#c4b5fd' }}>
            <Sparkles size={16} />
          </span>
          <div>
            <Eyebrow color="#c4b5fd" tracking="0.22em">New workspace</Eyebrow>
            <p style={{ margin:'2px 0 0', fontSize:16, fontWeight:600, color:'#fff' }}>새 포트폴리오 만들기</p>
          </div>
        </div>
        <div style={{ display:'grid', gap:10 }}>
          <div>
            <label style={{ display:'block', fontSize:11, color:'#94a3b8', marginBottom:5, letterSpacing:0.01 }}>제목</label>
            <div style={{
              height:38, padding:'0 14px', display:'flex', alignItems:'center', gap:8,
              borderRadius:10, border:'1px solid rgba(124,58,237,0.45)', background:'rgba(255,255,255,0.04)',
              fontSize:13, color:'#fff', boxShadow:'0 0 0 3px rgba(124,58,237,0.12)',
            }}>
              Launch Campaign Portfolio
              <span style={{ width:1.5, height:14, background:'#c4b5fd', marginLeft:1,
                animation:'fs-caret-blink 1s steps(1) infinite' }} />
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, color:'#94a3b8', marginBottom:5 }}>한 줄 설명</label>
            <div style={{
              height:38, padding:'0 14px', display:'flex', alignItems:'center',
              borderRadius:10, border:'1px solid rgba(255,255,255,0.10)', background:'rgba(255,255,255,0.04)',
              fontSize:12, color:'#cbd5e1',
            }}>봄 2026 시즌 캠페인 비주얼 시스템</div>
          </div>
        </div>
        {/* Highlight banner */}
        <div style={{
          marginTop:14, padding:'12px 14px', borderRadius:12,
          border:'1px solid rgba(252,211,77,0.20)', background:'rgba(252,211,77,0.05)',
          display:'flex', gap:10, alignItems:'flex-start',
        }}>
          <span style={{ color:'#fde68a', flexShrink:0, marginTop:1 }}><ShieldCheck size={14} /></span>
          <p style={{ margin:0, fontSize:12, color:'#fde68a', lineHeight:1.55 }}>
            결과물만이 아니라, <strong style={{ color:'#fff', fontWeight:600 }}>과정 파일까지 증거</strong>로 추적합니다.
            모든 업로드는 해시로 인증돼요.
          </p>
        </div>
        <div style={{ marginTop:14, display:'flex', gap:8, justifyContent:'flex-end' }}>
          <Btn variant="ghost" size="sm">취소</Btn>
          <Btn variant="primary" size="sm" iconRight={<ArrowRight size={12} />}>다음 — 파일 업로드</Btn>
        </div>
      </div>
    </div>
  </div>
);

// ─── Step 3: File upload (drop zone + verified files) ───
const MockUpload = ({ active }) => {
  const queued = [
    { name:'Brand system.pdf',     size:'4.2 MB',  ext:'pdf',  prog:100, hash:'a3f9c2b1', icon:<FileText size={16} />, tone:'#ddd6fe', bg:'rgba(167,139,250,0.10)' },
    { name:'Hero key visual.png',  size:'1.8 MB',  ext:'png',  prog:100, hash:'7c4e1d52', icon:<Image size={16} />,    tone:'#cffafe', bg:'rgba(103,232,249,0.10)' },
    { name:'Process journal.md',   size:'34 KB',   ext:'md',   prog:100, hash:'0b8e93cd', icon:<FileText size={16} />, tone:'#fde68a', bg:'rgba(252,211,77,0.10)' },
    { name:'Final delivery.zip',   size:'128 MB',  ext:'zip',  prog:68,  hash:'…',         icon:<Archive size={16} />,  tone:'#a7f3d0', bg:'rgba(110,231,183,0.10)' },
  ];
  return (
    <div style={{ background:'#070b15', minHeight:480 }}>
      <AppNavbar right={<Pill tone="violet" size="sm" icon={<Sparkles size={10} />}>Launch Campaign Portfolio</Pill>} />
      <div style={{ padding:'18px 22px', display:'grid', gridTemplateColumns:'1fr 280px', gap:14 }}>
        <div>
          {/* Drop zone */}
          <div style={{
            position:'relative', overflow:'hidden',
            borderRadius:14, border:'1.5px dashed rgba(167,139,250,0.40)',
            background:'radial-gradient(circle at 50% 30%, rgba(124,58,237,0.18), transparent 60%)',
            padding:'22px 18px', textAlign:'center',
          }}>
            <span style={{ display:'inline-flex', width:48, height:48, borderRadius:14,
              alignItems:'center', justifyContent:'center',
              background:'rgba(167,139,250,0.14)', color:'#c4b5fd',
              boxShadow:'0 0 28px rgba(124,58,237,0.30)',
              animation: active ? 'fs-float 3.5s ease-in-out infinite' : 'none' }}>
              <UploadCloud size={22} />
            </span>
            <p style={{ margin:'10px 0 2px', fontSize:14, fontWeight:600, color:'#fff' }}>여기에 파일을 끌어다 놓으세요</p>
            <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>PDF · PNG · MD · ZIP · FIG · JSON — 모두 인증됩니다</p>
            <div style={{ marginTop:10, display:'inline-flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
              {['기획서','발표자료','이미지','PDF','코드/압축'].map(t => (
                <Pill key={t} tone="cyan" size="sm">{t}</Pill>
              ))}
            </div>
          </div>
          {/* File list */}
          <div style={{ marginTop:12, display:'grid', gap:6 }}>
            {queued.map((f,i) => (
              <div key={f.name} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 12px', borderRadius:11,
                border:'1px solid rgba(255,255,255,0.08)', background:'rgba(11,16,32,0.85)',
                animation: active ? `fs-slide-up 0.5s ease ${0.15 + i*0.1}s both` : 'none',
              }}>
                <span style={{ width:32, height:32, borderRadius:8, display:'inline-flex',
                  alignItems:'center', justifyContent:'center', background:f.bg, color:f.tone }}>
                  {f.icon}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                    <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</p>
                    <p style={{ margin:0, fontSize:10, color:'#64748b', fontFamily:'var(--fs-font-mono)' }}>#{f.hash}</p>
                  </div>
                  <div style={{ marginTop:5, height:3, borderRadius:9999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                    <div style={{ width:`${f.prog}%`, height:'100%',
                      background: f.prog === 100
                        ? 'linear-gradient(90deg,#6ee7b7,#a7f3d0)'
                        : 'linear-gradient(90deg,#7c3aed,#22d3ee)' }} />
                  </div>
                </div>
                {f.prog === 100
                  ? <span style={{ color:'#6ee7b7' }}><ShieldCheck size={14} /></span>
                  : <span style={{ fontSize:10, color:'#94a3b8' }}>{f.prog}%</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Right: verification panel */}
        <div style={{
          borderRadius:14, border:'1px solid rgba(110,231,183,0.20)',
          background:'linear-gradient(160deg, rgba(110,231,183,0.10), rgba(11,16,32,0.85) 65%)',
          padding:16,
        }}>
          <Eyebrow color="#a7f3d0" tracking="0.22em">Proof on every file</Eyebrow>
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
            <Fingerprint size={20} style={{ color:'#a7f3d0' }} />
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#fff' }}>SHA-256 인증</p>
          </div>
          <p style={{ margin:'6px 0 0', fontSize:11, color:'#94a3b8', lineHeight:1.55 }}>
            업로드된 모든 파일은 타임스탬프 + 해시로 기록됩니다. 면접에서 “이 파일은 언제 만들었나요”에 답할 수 있어요.
          </p>
          <div style={{ marginTop:12, padding:'8px 10px', borderRadius:9,
            background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.06)',
            fontFamily:'var(--fs-font-mono)', fontSize:10, color:'#a7f3d0', lineHeight:1.65 }}>
            <span style={{ color:'#64748b' }}>hash</span>  a3f9c2b1…<br/>
            <span style={{ color:'#64748b' }}>at  </span>  2026-04-12 14:08:21<br/>
            <span style={{ color:'#64748b' }}>by  </span>  minjoonkim<br/>
            <span style={{ color:'#64748b' }}>cert</span>  fs:proof:v1
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 4: AI auto-organize ───
const MockOrganize = ({ active }) => {
  const cats = [
    { label:'시스템', icon:<Layers size={14} />, tone:'#c4b5fd', bg:'rgba(167,139,250,0.10)', files:['Brand system.pdf','Color tokens.json'] },
    { label:'비주얼', icon:<Image size={14} />, tone:'#cffafe', bg:'rgba(103,232,249,0.10)', files:['Hero key visual.png','Concept board.jpg','Microsite hifi.fig'] },
    { label:'문서', icon:<FileText size={14} />, tone:'#fde68a', bg:'rgba(252,211,77,0.10)', files:['Process journal.md','Research notes.md'] },
    { label:'아카이브', icon:<Archive size={14} />, tone:'#a7f3d0', bg:'rgba(110,231,183,0.10)', files:['Final delivery.zip'] },
  ];
  return (
    <div style={{ background:'#070b15', minHeight:480 }}>
      <AppNavbar right={<Pill tone="violet" size="sm" dot>AI 정리 중</Pill>} />
      <div style={{ padding:'18px 22px' }}>
        {/* Banner */}
        <div style={{
          display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:14,
          border:'1px solid rgba(167,139,250,0.25)',
          background:'linear-gradient(120deg, rgba(124,58,237,0.20), rgba(34,211,238,0.10) 70%)',
        }}>
          <span style={{ width:44, height:44, borderRadius:12, display:'inline-flex',
            alignItems:'center', justifyContent:'center',
            background:'rgba(167,139,250,0.18)', color:'#fff',
            boxShadow:'0 0 32px rgba(124,58,237,0.40)',
            animation: active ? 'fs-glow-pulse 2.5s ease-in-out infinite' : 'none' }}>
            <Wand2 size={20} />
          </span>
          <div style={{ flex:1 }}>
            <Eyebrow color="#c4b5fd" tracking="0.22em">VaultSage Smart Organizer</Eyebrow>
            <p style={{ margin:'4px 0 0', fontSize:14, fontWeight:600, color:'#fff' }}>18개 파일을 프로젝트 근거 구조로 분류 중</p>
          </div>
          <Pill tone="cyan" size="sm" icon={<Sparkles size={10} />}>78%</Pill>
        </div>
        {/* Categories */}
        <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
          {cats.map((c,i) => (
            <div key={c.label} style={{
              borderRadius:12, border:'1px solid rgba(255,255,255,0.08)',
              background:'rgba(11,16,32,0.85)', padding:12,
              animation: active ? `fs-spring-in 0.6s var(--fs-ease-spring) ${0.2 + i*0.12}s both` : 'none',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{ width:26, height:26, borderRadius:7, display:'inline-flex',
                  alignItems:'center', justifyContent:'center', background:c.bg, color:c.tone }}>
                  {c.icon}
                </span>
                <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#fff' }}>{c.label}</p>
                <span style={{ marginLeft:'auto', fontSize:10, color:'#64748b' }}>{c.files.length}개</span>
              </div>
              <div style={{ display:'grid', gap:5 }}>
                {c.files.map((f,fi) => (
                  <div key={f} style={{
                    display:'flex', alignItems:'center', gap:7,
                    padding:'5px 8px', borderRadius:7,
                    background:'rgba(255,255,255,0.025)',
                    fontSize:11, color:'#cbd5e1',
                    animation: active ? `fs-slide-up 0.4s ease ${0.5 + i*0.12 + fi*0.08}s both` : 'none',
                  }}>
                    <span style={{ color:'#6ee7b7' }}><CheckCircle2 size={11} /></span>
                    <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:11, color:'#64748b', textAlign:'center' }}>
          모든 파일은 의미별로 묶이며, 인용 가능한 “근거” 단위가 됩니다.
        </div>
      </div>
    </div>
  );
};

// ─── Step 5: Portfolio Story generation ───
const MockStory = ({ active }) => {
  const story = [
    { tag:'My Role', txt:'Lead designer · brand + art direction. 캠페인 시각 시스템 총괄.' },
    { tag:'Problem', txt:'캠페인이 채널마다 분기되며 톤이 달랐고, 인용할 산출물이 흩어져 있었음.' },
    { tag:'Solution', txt:'8주간 토큰화 → 자산 가이드 4개 → 런칭 마이크로사이트로 통합.' },
    { tag:'Impact', txt:'공유 자산 사용률 92%, CTR 18% 상승. 면접에서 매번 인용되는 케이스.' },
  ];
  return (
    <div style={{ background:'#070b15', minHeight:480 }}>
      <AppNavbar right={<Pill tone="violet" size="sm" dot>Story 생성 완료</Pill>} />
      <div style={{ padding:'18px 22px', display:'grid', gridTemplateColumns:'1fr 240px', gap:14 }}>
        <div>
          {/* Summary card */}
          <div style={{
            position:'relative', overflow:'hidden',
            borderRadius:14, padding:'16px 18px',
            border:'1px solid rgba(167,139,250,0.22)',
            background:'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(11,16,32,0.85) 65%)',
          }}>
            <Eyebrow color="#c4b5fd" tracking="0.22em">Summary · Generated</Eyebrow>
            <p style={{ margin:'6px 0 0', fontSize:15, fontWeight:600, color:'#fff', lineHeight:1.45 }}>
              봄 2026 캠페인 비주얼 시스템.<br/>
              9주의 스프린트, 18개 파일, <span style={{ color:'#a5f3fc' }}>인용 가능한 4개 핵심 결정</span>.
            </p>
          </div>
          {/* Role/Problem/Solution/Impact */}
          <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {story.map((s,i) => (
              <div key={s.tag} style={{
                borderRadius:11, padding:12, border:'1px solid rgba(255,255,255,0.08)',
                background:'rgba(11,16,32,0.85)',
                animation: active ? `fs-slide-up 0.5s ease ${0.2 + i*0.1}s both` : 'none',
              }}>
                <Eyebrow color="#a5f3fc" tracking="0.22em">{s.tag}</Eyebrow>
                <p style={{ margin:'6px 0 0', fontSize:11.5, color:'#e2e8f0', lineHeight:1.55 }}>{s.txt}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Right rail: Evidence + Questions */}
        <div style={{ display:'grid', gap:10, alignContent:'start' }}>
          <div style={{ borderRadius:12, border:'1px solid rgba(110,231,183,0.20)', background:'rgba(110,231,183,0.04)', padding:12 }}>
            <Eyebrow color="#a7f3d0" tracking="0.22em">Evidence Highlights</Eyebrow>
            <div style={{ marginTop:8, display:'grid', gap:5 }}>
              {['Brand system.pdf','Hero key visual.png','Research notes.md'].map((f,i) => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#cbd5e1',
                  animation: active ? `fs-slide-up 0.4s ease ${0.4 + i*0.1}s both` : 'none' }}>
                  <ShieldCheck size={11} style={{ color:'#6ee7b7', flexShrink:0 }} />
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius:12, border:'1px solid rgba(252,211,77,0.20)', background:'rgba(252,211,77,0.04)', padding:12 }}>
            <Eyebrow color="#fde68a" tracking="0.22em">Interview Questions</Eyebrow>
            <div style={{ marginTop:8, display:'grid', gap:6, fontSize:10.5, color:'#e2e8f0', lineHeight:1.55 }}>
              <p style={{ margin:0 }}>“가장 어려웠던 의사결정은?”</p>
              <p style={{ margin:0 }}>“CTR 18% 향상의 근거는?”</p>
              <p style={{ margin:0 }}>“시스템 토큰을 8주에 정리한 비결?”</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MockDashboard, MockCreate, MockUpload, MockOrganize, MockStory });
