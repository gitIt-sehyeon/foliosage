// Mock product screens — steps 6..10 of the FolioSage flow.
// 6: Readiness checklist
// 7: AI Portfolio Review (Defense Room)
// 8: Publish / share link
// 9: Public viewer (/p/{shareCode}) — story + files + AI chat
// 10: Stats + certificate badge close-up

// ─── Step 6: Readiness checklist ───
const MockReadiness = ({ active }) => {
  const items = [
    { key:'story',  label:'Story 작성',         status:'done', desc:'Role / Problem / Solution / Impact 모두 작성됨' },
    { key:'evid',   label:'Evidence 연결',       status:'done', desc:'18개 파일 모두 해시 인증됨' },
    { key:'ai',     label:'AI Review 통과',     status:'done', desc:'예상 면접 질문 12개에 답변 준비됨' },
    { key:'public', label:'Public Link 발급',   status:'todo', desc:'아직 공개되지 않았습니다' },
  ];
  const score = 82;
  return (
    <div style={{ background:'#070b15', minHeight:480 }}>
      <AppNavbar right={<Pill tone="amber" size="sm" dot>제출 준비 82%</Pill>} />
      <div style={{ padding:'18px 22px', display:'grid', gridTemplateColumns:'1fr 240px', gap:14 }}>
        <div style={{ display:'grid', gap:8 }}>
          <Eyebrow color="#a5f3fc" tracking="0.24em">Readiness</Eyebrow>
          <p style={{ margin:0, fontSize:18, fontWeight:600, color:'#fff', letterSpacing:'-0.01em' }}>
            제출 가능한 상태인가요?
          </p>
          <div style={{ display:'grid', gap:7, marginTop:6 }}>
            {items.map((it, i) => {
              const done = it.status === 'done';
              return (
                <div key={it.key} style={{
                  display:'flex', alignItems:'center', gap:11,
                  borderRadius:11, padding:'10px 12px',
                  border:'1px solid ' + (done ? 'rgba(110,231,183,0.20)' : 'rgba(252,211,77,0.18)'),
                  background: done ? 'rgba(110,231,183,0.04)' : 'rgba(252,211,77,0.04)',
                  animation: active ? `fs-slide-up 0.5s ease ${0.1 + i*0.1}s both` : 'none',
                }}>
                  <span style={{
                    width:28, height:28, borderRadius:8, display:'inline-flex',
                    alignItems:'center', justifyContent:'center',
                    background: done ? 'rgba(110,231,183,0.18)' : 'rgba(252,211,77,0.10)',
                    color: done ? '#6ee7b7' : '#fcd34d',
                  }}>
                    {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:12.5, fontWeight:600, color:'#fff' }}>{it.label}</p>
                    <p style={{ margin:'2px 0 0', fontSize:10.5, color:'#94a3b8' }}>{it.desc}</p>
                  </div>
                  {done ? <Pill tone="emerald" size="sm">완료</Pill> : <Pill tone="amber" size="sm">남음</Pill>}
                </div>
              );
            })}
          </div>
        </div>
        {/* Score gauge */}
        <div style={{
          borderRadius:14, padding:16,
          border:'1px solid rgba(167,139,250,0.20)',
          background:'linear-gradient(160deg, rgba(124,58,237,0.20), rgba(11,16,32,0.85) 70%)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        }}>
          <Eyebrow color="#c4b5fd" tracking="0.22em">Score</Eyebrow>
          <div style={{ position:'relative', marginTop:8, width:130, height:130 }}>
            <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%' }}>
              <defs>
                <linearGradient id="readiness-gauge-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="url(#readiness-gauge-grad)" strokeWidth="8" fill="none"
                strokeLinecap="round" pathLength="100"
                strokeDasharray={`${active ? score : 0} 100`}
                style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dasharray 1.6s var(--fs-ease)' }} />
            </svg>
            <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', flexDirection:'column' }}>
              <p style={{ margin:0, fontSize:32, fontWeight:600, color:'#fff', letterSpacing:'-0.02em' }}>{score}</p>
              <p style={{ margin:'-4px 0 0', fontSize:10, color:'#94a3b8' }}>/ 100</p>
            </div>
          </div>
          <p style={{ margin:'8px 0 0', fontSize:11, color:'#94a3b8', textAlign:'center', lineHeight:1.5 }}>
            공개 링크 발급만 남았어요.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Step 7: AI Portfolio Review (Defense Room) ───
const MockReview = ({ active }) => {
  const rubric = [
    { k:'명확성',     v:92, tone:'emerald' },
    { k:'근거 인용',  v:88, tone:'emerald' },
    { k:'결과 측정',  v:74, tone:'amber' },
    { k:'대안 비교',  v:62, tone:'amber' },
  ];
  return (
    <div style={{ background:'#070b15', minHeight:480 }}>
      <AppNavbar right={<>
        <Pill tone="violet" size="sm" icon={<Sparkles size={10} />}>AI Review</Pill>
        <Pill tone="emerald" size="sm" icon={<ShieldCheck size={10} />}>업로드 파일 근거</Pill>
      </>} />
      <div style={{ padding:'16px 22px', display:'grid', gridTemplateColumns:'1.15fr 1fr', gap:14 }}>
        {/* Q/A column */}
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          <Eyebrow color="#c4b5fd" tracking="0.24em">Defense room · 면접 시뮬레이션</Eyebrow>
          {/* Question */}
          <div style={{
            borderRadius:12, padding:'10px 14px',
            border:'1px solid rgba(167,139,250,0.22)', background:'rgba(167,139,250,0.06)',
            animation: active ? 'fs-slide-up 0.5s ease 0.1s both' : 'none',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
              <Bot size={13} style={{ color:'#c4b5fd' }} />
              <p style={{ margin:0, fontSize:10.5, color:'#c4b5fd', fontWeight:600 }}>AI 심사관 · Q.3</p>
            </div>
            <p style={{ margin:0, fontSize:13, color:'#fff', lineHeight:1.55 }}>
              CTR 18% 상승은 어떤 변수의 영향이라고 보시나요? 근거 파일은요?
            </p>
          </div>
          {/* User answer */}
          <div style={{
            alignSelf:'flex-end', maxWidth:'88%',
            borderRadius:12, padding:'10px 14px',
            background:'linear-gradient(135deg, #6d28d9, #7c3aed)',
            color:'#fff', fontSize:12.5, lineHeight:1.55,
            boxShadow:'0 8px 20px rgba(109,40,217,0.30)',
            animation: active ? 'fs-slide-up 0.5s ease 0.4s both' : 'none',
          }}>
            메인 비주얼의 일관성과 페이지 진입 카피의 명확성이 가장 컸어요. <br/>
            <span style={{ color:'#cffafe' }}>Research notes.md</span> 12-18주차 노트에서 측정값 확인할 수 있습니다.
          </div>
          {/* AI feedback */}
          <div style={{
            borderRadius:12, padding:'10px 14px',
            border:'1px solid rgba(167,139,250,0.18)', background:'rgba(11,16,32,0.85)',
            animation: active ? 'fs-slide-up 0.5s ease 0.75s both' : 'none',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
              <Sparkles size={12} style={{ color:'#fde68a' }} />
              <p style={{ margin:0, fontSize:10.5, color:'#fde68a', fontWeight:600 }}>피드백</p>
            </div>
            <p style={{ margin:0, fontSize:12, color:'#e2e8f0', lineHeight:1.6 }}>
              근거 인용은 명확합니다. <strong style={{ color:'#fff' }}>대안 비교가 부족</strong>해요 — “왜 A/B 테스트가 아닌 이 결정?”에
              대한 노트를 추가하면 점수가 올라갑니다.
            </p>
            <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
              <Pill tone="emerald" size="sm" icon={<ShieldCheck size={10} />}>Research notes.md</Pill>
              <Pill tone="emerald" size="sm" icon={<ShieldCheck size={10} />}>Brand system.pdf</Pill>
            </div>
          </div>
        </div>
        {/* Score column */}
        <div style={{ display:'grid', gap:10, alignContent:'start' }}>
          <div style={{
            borderRadius:14, padding:16,
            border:'1px solid rgba(110,231,183,0.20)',
            background:'linear-gradient(160deg, rgba(110,231,183,0.10), rgba(11,16,32,0.85) 60%)',
          }}>
            <Eyebrow color="#a7f3d0" tracking="0.22em">Overall score</Eyebrow>
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:6 }}>
              <p style={{ margin:0, fontSize:40, fontWeight:600, color:'#fff', letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums' }}>79</p>
              <p style={{ margin:0, fontSize:13, color:'#94a3b8' }}>/ 100</p>
              <span style={{ marginLeft:'auto' }}><Pill tone="emerald" size="sm">제출 가능</Pill></span>
            </div>
          </div>
          <div style={{
            borderRadius:14, padding:14,
            border:'1px solid rgba(255,255,255,0.10)', background:'rgba(11,16,32,0.85)',
          }}>
            <Eyebrow color="#94a3b8" tracking="0.22em">Rubric</Eyebrow>
            <div style={{ marginTop:8, display:'grid', gap:7 }}>
              {rubric.map((r,i) => (
                <div key={r.k} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11 }}>
                  <span style={{ width:70, color:'#cbd5e1' }}>{r.k}</span>
                  <div style={{ flex:1, height:5, borderRadius:9999, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                    <div style={{
                      width: active ? `${r.v}%` : '0%', height:'100%',
                      background: r.tone === 'emerald'
                        ? 'linear-gradient(90deg,#6ee7b7,#a7f3d0)'
                        : 'linear-gradient(90deg,#fcd34d,#fde68a)',
                      transition:`width 1.4s var(--fs-ease) ${0.4 + i*0.12}s`,
                    }} />
                  </div>
                  <span style={{ width:30, textAlign:'right', color:'#fff', fontFamily:'var(--fs-font-mono)', fontSize:11 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 8: Publish / share link ───
const MockPublish = ({ active }) => (
  <div style={{ background:'#070b15', minHeight:480, position:'relative', overflow:'hidden' }}>
    <AppNavbar right={<Pill tone="emerald" size="sm" dot>Published</Pill>} />
    {/* dim bg */}
    <div style={{ padding:'18px 22px', filter:'blur(2px)', opacity:0.35 }}>
      <div style={{ height:60, borderRadius:12, background:'rgba(255,255,255,0.04)', marginBottom:10 }} />
      <div style={{ height:140, borderRadius:12, background:'rgba(255,255,255,0.04)' }} />
    </div>
    <div style={{
      position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(6,9,18,0.6)', backdropFilter:'blur(6px)',
    }}>
      <div style={{
        width:'min(540px, 92%)',
        borderRadius:18, padding:22,
        border:'1px solid rgba(110,231,183,0.25)',
        background:'linear-gradient(140deg, rgba(110,231,183,0.14), rgba(11,16,32,0.94) 55%)',
        boxShadow:'0 30px 80px rgba(0,0,0,0.55), 0 0 56px rgba(110,231,183,0.18)',
        animation: active ? 'fs-spring-in 0.55s var(--fs-ease-spring) both' : 'none',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:36, height:36, borderRadius:11, display:'inline-flex',
            alignItems:'center', justifyContent:'center',
            background:'rgba(110,231,183,0.16)', color:'#a7f3d0' }}>
            <Globe2 size={18} />
          </span>
          <div>
            <Eyebrow color="#a7f3d0" tracking="0.22em">Live</Eyebrow>
            <p style={{ margin:'2px 0 0', fontSize:16, fontWeight:600, color:'#fff' }}>포트폴리오가 공개되었습니다</p>
          </div>
        </div>
        <p style={{ margin:'10px 0 0', fontSize:12, color:'#94a3b8', lineHeight:1.6 }}>
          누구나 링크로 작품을 보고, AI Guide에게 질문할 수 있어요.
        </p>
        <div style={{
          marginTop:14, display:'flex', alignItems:'center', gap:8,
          padding:'10px 12px', borderRadius:11,
          border:'1px solid rgba(255,255,255,0.10)', background:'rgba(0,0,0,0.30)',
        }}>
          <Link2 size={14} style={{ color:'#a5f3fc' }} />
          <p style={{ margin:0, flex:1, fontSize:12.5, fontFamily:'var(--fs-font-mono)', color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            foliosage.com/p/9k7m2-launch
          </p>
          <Btn variant="outline" size="sm" icon={<Copy size={12} />}>복사</Btn>
        </div>
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Btn variant="primary" size="md" icon={<ExternalLink size={14} />} fullWidth>라이브 페이지 열기</Btn>
          <Btn variant="outline" size="md" icon={<Share2 size={14} />} fullWidth>공유</Btn>
        </div>
        <div style={{ marginTop:14, display:'flex', gap:6, flexWrap:'wrap' }}>
          <Pill tone="emerald" size="sm" icon={<CheckCircle2 size={10} />}>18 verified</Pill>
          <Pill tone="violet" size="sm" icon={<Sparkles size={10} />}>AI Guide 활성</Pill>
          <Pill tone="cyan" size="sm" icon={<Eye size={10} />}>SEO 메타 자동</Pill>
        </div>
      </div>
    </div>
  </div>
);

// ─── Step 9: Public viewer (visitor screen) ───
const MockVisitor = ({ active }) => (
  <div style={{ background:'#070b15', minHeight:480 }}>
    {/* Visitor chrome bar */}
    <div style={{
      height:42, padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
      borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(7,11,21,0.88)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <FolioLogo size={20} />
        <span style={{ width:1, height:14, background:'rgba(255,255,255,0.10)' }} />
        <span style={{ fontSize:10.5, color:'#64748b', letterSpacing:'0.18em', textTransform:'uppercase' }}>방문자 화면 · 민준</span>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <Pill tone="emerald" size="sm" icon={<CheckCircle2 size={10} />}>FolioSage 검증</Pill>
        <Btn variant="outline" size="sm" icon={<Heart size={11} />}>24</Btn>
      </div>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', minHeight:438 }}>
      {/* Story column */}
      <article style={{ padding:'18px 22px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          <Pill tone="violet" size="sm" dot>Live · 2026.05.06</Pill>
          <Pill tone="cyan" size="sm" icon={<Sparkles size={10} />}>AI reviewed</Pill>
        </div>
        <h1 style={{
          margin:0, fontSize:34, fontWeight:600, letterSpacing:'-0.025em', lineHeight:0.98,
          background:'linear-gradient(120deg, #fff 0%, #ddd6fe 50%, #67e8f9 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          animation: active ? 'fs-slide-up 0.6s ease both' : 'none',
        }}>Launch<br/>Campaign<br/>
          <span style={{
            background:'linear-gradient(120deg, #f59e0b 0%, #ec4899 50%, #a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontStyle:'italic',
          }}>Portfolio.</span>
        </h1>
        <p style={{ margin:'14px 0 0', fontSize:12, color:'#94a3b8', lineHeight:1.6, maxWidth:420 }}>
          9주의 스프린트로 봄 2026 캠페인의 시각 시스템을 구축. 네이밍, 아트 디렉션, 자산 파이프라인, 런칭 마이크로사이트.
        </p>
        {/* Hero image placeholder */}
        <div style={{
          marginTop:14, height:96, borderRadius:14, overflow:'hidden',
          border:'1px solid rgba(255,255,255,0.06)',
          background:'radial-gradient(circle at 25% 30%, rgba(167,139,250,0.55), transparent 50%),'+
                     'radial-gradient(circle at 80% 65%, rgba(34,211,238,0.40), transparent 55%),'+
                     'radial-gradient(circle at 60% 20%, rgba(245,158,11,0.35), transparent 45%),'+
                     'linear-gradient(135deg, #1e1b4b, #0b1020 60%, #0f172a)',
          position:'relative',
        }}>
          <div style={{ position:'absolute', left:12, bottom:10, padding:'3px 8px', borderRadius:9999,
            background:'rgba(11,16,32,0.7)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.10)', fontSize:9.5, color:'#cbd5e1',
            display:'inline-flex', alignItems:'center', gap:6 }}>
            <Palette size={10} style={{ color:'#fde68a' }} /> Hero key visual · concept_v3.png
          </div>
        </div>
        {/* File bento mini */}
        <div style={{ marginTop:12, display:'grid', gap:6, gridTemplateColumns:'2fr 1fr 1fr', gridAutoRows:60 }}>
          {[
            { t:'Brand system', e:'pdf', tone:'#ddd6fe', bg:'rgba(167,139,250,0.10)' },
            { t:'Color tokens', e:'json', tone:'#a7f3d0', bg:'rgba(110,231,183,0.10)' },
            { t:'Process journal', e:'md', tone:'#fde68a', bg:'rgba(252,211,77,0.10)' },
          ].map(f => (
            <div key={f.t} style={{ borderRadius:10, padding:10, border:'1px solid rgba(255,255,255,0.06)',
              background:'rgba(11,16,32,0.85)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <span style={{ width:24, height:24, borderRadius:7, display:'inline-flex',
                alignItems:'center', justifyContent:'center', background:f.bg, color:f.tone }}>
                <FileCheck2 size={13} />
              </span>
              <div>
                <p style={{ margin:0, fontSize:11, fontWeight:600, color:'#fff' }}>{f.t}</p>
                <p style={{ margin:0, fontSize:9, color:'#475569', fontFamily:'var(--fs-font-mono)' }}>.{f.e}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
      {/* AI chat aside */}
      <aside style={{
        borderLeft:'1px solid rgba(255,255,255,0.08)', background:'rgba(7,11,21,0.88)',
        padding:14, display:'flex', flexDirection:'column', gap:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:28, height:28, borderRadius:8, display:'inline-flex',
            alignItems:'center', justifyContent:'center',
            background:'rgba(167,139,250,0.12)', color:'#c4b5fd' }}>
            <Sparkles size={14} />
          </span>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#fff' }}>AI Guide</p>
            <p style={{ margin:0, fontSize:10, color:'#64748b' }}>18개 파일에서 답변</p>
          </div>
          <span style={{ width:7, height:7, borderRadius:9999, background:'#6ee7b7', boxShadow:'0 0 12px #6ee7b7' }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, flex:1 }}>
          <div style={{ alignSelf:'flex-end', padding:'7px 10px', borderRadius:10,
            borderBottomRightRadius:3,
            background:'linear-gradient(135deg, #6d28d9, #7c3aed)', color:'#fff',
            fontSize:10.5, lineHeight:1.45, maxWidth:'90%',
            animation: active ? 'fs-slide-up 0.4s ease 0.2s both' : 'none' }}>
            가장 강한 증거 파일 3개?
          </div>
          <div style={{ alignSelf:'flex-start', padding:'8px 11px', borderRadius:10,
            borderBottomLeftRadius:3,
            border:'1px solid rgba(167,139,250,0.20)',
            background:'linear-gradient(140deg, rgba(167,139,250,0.10), rgba(34,211,238,0.04))',
            color:'#e2e8f0', fontSize:10.5, lineHeight:1.55, maxWidth:'92%',
            animation: active ? 'fs-answer-reveal 1s ease 0.6s both' : 'none' }}>
            Brand system PDF, Campaign stills, Research notes — 세 파일이 시각 시스템·산출물 품질·의사결정의 근거를 보여줍니다.
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:2,
            animation: active ? 'fs-slide-up 0.4s ease 1.5s both' : 'none' }}>
            {['Brand system.pdf','Campaign stills.zip','Research notes.md'].map(s => (
              <Pill key={s} tone="emerald" size="sm" icon={<ShieldCheck size={9} />}>{s}</Pill>
            ))}
          </div>
        </div>
        <div style={{
          display:'flex', gap:6, padding:'6px 8px', borderRadius:10,
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
        }}>
          <input placeholder="무엇이든 물어보세요" disabled style={{
            flex:1, border:0, background:'transparent', color:'#cbd5e1',
            fontSize:10.5, outline:'none', fontFamily:'inherit',
          }} />
          <span style={{ width:24, height:24, borderRadius:7, display:'inline-flex',
            alignItems:'center', justifyContent:'center',
            background:'#6d28d9', color:'#fff' }}>
            <Send size={11} />
          </span>
        </div>
      </aside>
    </div>
  </div>
);

// ─── Step 10: Stats + Certificate close-up ───
const MockStats = ({ active }) => {
  const days = [4,7,12,9,18,24,21,28,34,29,38,42,46];
  const max = 46;
  return (
    <div style={{ background:'#070b15', minHeight:480 }}>
      <AppNavbar right={<>
        <Pill tone="emerald" size="sm" dot>Live</Pill>
        <Pill tone="cyan" size="sm" icon={<Eye size={10} />}>1,284 views</Pill>
      </>} />
      <div style={{ padding:'18px 22px', display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:14 }}>
        {/* Stats column */}
        <div>
          <Eyebrow color="#a5f3fc" tracking="0.24em">최근 13일 · 방문</Eyebrow>
          <div style={{
            marginTop:10, borderRadius:14, padding:'14px 14px 10px',
            border:'1px solid rgba(255,255,255,0.10)', background:'rgba(11,16,32,0.85)',
          }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <p style={{ margin:0, fontSize:30, fontWeight:600, color:'#fff', letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>1,284</p>
              <Pill tone="emerald" size="sm">↑ 38%</Pill>
            </div>
            <p style={{ margin:'2px 0 12px', fontSize:11, color:'#64748b' }}>총 방문 · 23명 AI에게 질문</p>
            {/* Bar chart */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:90 }}>
              {days.map((d, i) => (
                <div key={i} style={{
                  flex:1, height:active ? `${(d/max)*100}%` : '6%', minHeight:6,
                  borderRadius:'4px 4px 0 0',
                  background:'linear-gradient(180deg, #a78bfa 0%, #22d3ee 100%)',
                  transition:`height 1.2s var(--fs-ease) ${0.1 + i*0.04}s`,
                  opacity: 0.5 + (d/max)*0.5,
                }} />
              ))}
            </div>
          </div>
          <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <StatTile value="342" label="AI 응답 횟수" icon={<MessageSquareText size={16} />} tone="violet" style={{ padding:12 }} />
            <StatTile value="86" label="파일 다운로드" icon={<Download size={16} />} tone="cyan" style={{ padding:12 }} />
          </div>
        </div>
        {/* Certificate close-up */}
        <div style={{
          position:'relative', overflow:'hidden',
          borderRadius:16, padding:18,
          border:'1px solid rgba(110,231,183,0.25)',
          background:'linear-gradient(160deg, rgba(110,231,183,0.16), rgba(11,16,32,0.92) 60%)',
          display:'flex', flexDirection:'column',
        }}>
          <div aria-hidden style={{
            position:'absolute', inset:0,
            background:'radial-gradient(circle at 100% 0%, rgba(110,231,183,0.30), transparent 50%)',
            pointerEvents:'none',
          }} />
          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:30, height:30, borderRadius:9, display:'inline-flex',
                alignItems:'center', justifyContent:'center',
                background:'rgba(110,231,183,0.20)', color:'#a7f3d0' }}>
                <Award size={15} />
              </span>
              <Eyebrow color="#a7f3d0" tracking="0.22em">Creation certificate</Eyebrow>
            </div>
            <p style={{ margin:'10px 0 0', fontSize:14, fontWeight:600, color:'#fff', lineHeight:1.4 }}>
              Brand system.pdf
            </p>
            <p style={{ margin:'4px 0 12px', fontSize:11, color:'#94a3b8' }}>
              해시 + 타임스탬프 + 작성자 서명으로 증명됩니다.
            </p>
            <div style={{ display:'grid', gap:5, fontSize:10.5, fontFamily:'var(--fs-font-mono)', color:'#cbd5e1' }}>
              {[
                ['hash','SHA-256','a3f9c2b1ce5d…'],
                ['at',  'created', '2026-04-12 14:08:21'],
                ['by',  'creator', 'minjoonkim'],
                ['cert','format',  'fs:proof:v1'],
              ].map(([k, lbl, v]) => (
                <div key={k} style={{ display:'flex', gap:8 }}>
                  <span style={{ width:34, color:'#475569' }}>{k}</span>
                  <span style={{ width:54, color:'#64748b' }}>{lbl}</span>
                  <span style={{ color:'#a7f3d0' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:'auto', paddingTop:12, display:'flex', gap:6, flexWrap:'wrap' }}>
              <Pill tone="emerald" size="sm" icon={<ShieldCheck size={10} />}>Verified</Pill>
              <Pill tone="cyan" size="sm" icon={<Fingerprint size={10} />}>Public proof</Pill>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MockReadiness, MockReview, MockPublish, MockVisitor, MockStats });
