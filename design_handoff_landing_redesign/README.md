# Handoff: FolioSage 랜딩 페이지 리디자인

## Overview

`foliosage-frontend/app/page.tsx` (랜딩 페이지)를 **풀-스크롤 제품 데모 형식**으로 재설계한 디자인입니다. 사용자가 위에서 아래로 스크롤하면 FolioSage의 7가지 핵심 사용 모먼트가 풀-블리드 섹션으로 펼쳐지며, 실제 제품 화면 목업이 함께 보입니다.

기존 페이지의 hero + 3-card 구조 대신:

1. **Hero** — 큰 한국어 타이포 ("포트폴리오에게 / *물어보세요.*"), shimmer gradient
2. **Moments × 7** — 4개 hero 모먼트(큰 제품 화면) + 3개 zoom-in 모먼트(컴포넌트 close-up) 교차 배치
3. **Capabilities** — 4-카드 기능 요약
4. **Gallery** — 라이브 예시 포트폴리오 3개
5. **Final CTA** — 큰 타이포 + 액션 그룹
6. **Footer**

## About the Design Files

`source/` 폴더 안에 들어있는 파일들은 **디자인 레퍼런스**입니다 — HTML로 만든 프로토타입이며, 의도된 모양과 동작을 보여줍니다. 그대로 production으로 옮기지 마세요.

작업 목표는 이 디자인을 **`foliosage-frontend/` 코드베이스의 기존 환경에서 재구현**하는 것입니다:

- **Next.js 16 + React 19**
- **Tailwind CSS v4** (`app/globals.css`의 토큰 활용)
- **shadcn (base-nova)** — `components/ui/{button,card,input,badge,label}.tsx`
- **@base-ui/react**
- **lucide-react** (HTML 프로토타입에서는 lucide 아이콘을 손으로 다시 그렸지만, 코드베이스에는 `lucide-react` 패키지가 이미 있으니 그쪽을 사용)

## Fidelity

**High-fidelity.** 컬러, 타이포, 간격, 모션이 의도된 값입니다. 코드베이스의 기존 컴포넌트(`Button`, `Card`, `Input`, `Badge`)를 사용해서 픽셀 단위로 재현하시면 됩니다.

---

## 작업 범위

**파일별로 변경할 대상:**

| 파일 | 변경 |
|------|------|
| `app/page.tsx` | **전면 재작성**. 현재의 hero + product window mockup + capability cards 구조를 새 7-moment 구조로 교체. |
| `app/globals.css` | 추가할 keyframe 없음 (기존 `aurora`, `shimmer`, `dp-float`, `glow-pulse`, `slide-up`, `spring-in`, `answer-reveal`, `progress-fill`로 충분). 필요시 `caret-blink`만 추가. |
| `components/` | **새 컴포넌트** 다음 3개를 추가 권장: <br>- `LandingMockOrganize.tsx` <br>- `LandingMockStory.tsx` <br>- `LandingMockReview.tsx` <br>- `LandingMockVisitor.tsx` <br>- `LandingZoomCertificate.tsx` <br>- `LandingZoomReadiness.tsx` <br>- `LandingZoomShare.tsx` <br>그리고 이들을 `app/page.tsx`에서 `<Moment>` 래퍼로 조합. |

---

## 전체 페이지 구조

```
<main className="relative min-h-screen overflow-hidden bg-[#060912] text-white">
  <BackgroundLayers />              {/* grid + aurora + vignette — 기존 코드와 동일 */}
  <TopNav />                        {/* sticky, z-50 */}
  <Hero />                          {/* viewport-tall, bold Korean type */}
  <MomentsIntro />                  {/* eyebrow + title */}
  <MomentHero01 ... />              {/* Upload + Organize */}
  <MomentZoom02 ... />              {/* Certificate close-up */}
  <MomentHero03 ... />              {/* Story generate */}
  <MomentZoom04 ... reverse />      {/* Readiness gauge — reversed layout */}
  <MomentHero05 ... align="right"/> {/* AI Review (right-aligned copy) */}
  <MomentZoom06 ... />              {/* Share / live link */}
  <MomentHero07 ... />              {/* Visitor + AI chat */}
  <Capabilities />                  {/* 4 feature cards */}
  <Gallery />                       {/* 3 example portfolios */}
  <FinalCTA />                      {/* big closing CTA */}
  <Footer />
</main>
```

---

## 디자인 토큰 (모두 codebase의 `globals.css`에 이미 있음)

### Background (FolioSage void)
```css
/* page base */
bg: #060912

/* grid lines */
background-image:
  linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px),
  linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px);
background-size: 44px 44px;

/* aurora blobs */
background:
  radial-gradient(circle at 18% 14%, rgba(124,58,237,0.28), transparent 30%),
  radial-gradient(circle at 84% 22%, rgba(34,211,238,0.18), transparent 28%),
  radial-gradient(circle at 56% 88%, rgba(245,158,11,0.12), transparent 26%);
animation: aurora 18s ease infinite;
```

### Color palette (codebase tokens 그대로)
- **Brand violet**: `#6d28d9` (primary fill), `#7c3aed` (hover), `#a78bfa` (light), `#c4b5fd` (text), `#ddd6fe` (lightest)
- **Accent cyan**: `#67e8f9`, `#a5f3fc`, `#cffafe`
- **Tertiary amber**: `#fcd34d`, `#fde68a`
- **Success emerald**: `#6ee7b7`, `#a7f3d0`
- **Surfaces**: `#070b15`, `#0b1020` (card), `#111827` (hover)
- **Borders**: `rgba(255,255,255,0.10)` default

### Typography
- **Font**: Inter (already loaded via next/font)
- **Hero h1**: `clamp(52px, 8vw, 128px)`, font-weight 600~700, line-height 0.92, letter-spacing -0.035em
- **Moment title (h3)**: `clamp(30px, 3.6vw, 52px)`, weight 600, line-height 1.04, tracking -0.025em
- **Section h2**: `clamp(36px, 4.6vw, 68px)`, weight 600
- **Body**: 16-17px, slate-300/400, line-height 1.65
- **Eyebrow**: 11px font-medium, tracking 0.26-0.28em, uppercase, text-cyan-200 또는 text-slate-500

### Radii
- 카드: `rounded-2xl` (18px), zoom 카드: 22px, 큰 CTA 박스: 28px

### Motion
- 모든 등장 모션은 IntersectionObserver 기반 (threshold 0.15~0.3)
- Easing: `var(--fs-ease-spring)` = `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Hero mockups: `translateY(40px) scale(0.96)` → `translateY(0) scale(1)`, duration 0.8~0.9s
- Zoom cards: `translateX(±30px)` 좌우 진입

---

## 섹션별 상세 명세

### 1) Hero
- **Padding**: `40px 32px 56px`, max-width 1280px
- **Pill** (위): cyan dot pill, "작업 파일 → 인증된 포트폴리오 → AI 가이드"
- **H1** (한국어):
  - "포트폴리오에게" (1줄, 흰색)
  - "물어보세요." (2줄, shimmer gradient text)
  - Shimmer: `linear-gradient(120deg, #a78bfa 0%, #ffffff 35%, #67e8f9 70%, #a78bfa 100%)`, 200% bg-size, `animation: shimmer 4s linear infinite`
- **서브카피**: 480-600px max-width, "업로드한 프로젝트 파일을 AI가 정리해 면접에서 통하는 이야기로 만들어줍니다. 모든 파일은 해시로 인증되고, 방문자는 작품에 직접 질문할 수 있어요."
- **CTA**: violet primary `포트폴리오 만들기 →` + outline `데모 둘러보기`
- **Down indicator**: 작은 원형 아이콘 + 11px uppercase "스크롤해서 어떻게 사용하는지 보기", `animation: float 3.5s`

### 2) MomentsIntro
- Eyebrow: `HOW IT WORKS · 7 MOMENTS`
- H2: "업로드부터 면접까지, 일곱 장면." (마지막 한 줄은 gradient text)

### 3) Moment Hero (×4) 공통 구조
- **Section**: `min-h-screen`, padding `14vh 32px`, flex column, max-width 1280px
- **Copy block 위쪽**: align left 또는 right (모먼트마다 다름)
  - 행: `[01]` (mono violet) — `—` (1px line) — `Pill(violet)` 의 inline-flex
  - H3 (clamp 30-52px)
  - 본문 (17px slate-400)
- **Mockup**: max-width 1100px, centered
- **Halo**: `conic-gradient(from {angle}deg, ...colors...)`, `filter: blur(100px)`, opacity 0.65, inset -50px
- **Frame chrome**: 18px radius, dark frame border, fake macOS traffic lights, mono-font label center, status pill right

각 모먼트별 데이터:

| # | tag | title | mockup |
|---|------|-------|--------|
| 01 | "Upload + Organize" | "파일을 던지면, 의미로 묶입니다." | MockOrganize — 카테고리(시스템/비주얼/문서/아카이브)로 파일이 분류되는 화면 |
| 03 | "Generate Story" | "Summary · Role · Problem · Solution · Impact." | MockStory — 자동 생성된 5섹션 + Evidence Highlights + Interview Questions |
| 05 | "AI Portfolio Review" | "단순 챗봇이 아닙니다. 업로드한 파일을 근거로 채점합니다." | MockReview — Q/A 흐름 + rubric bar chart + 점수 |
| 07 | "Visitor · AI Guide" | "방문자는 묻고, 작품이 답합니다." | MockVisitor — 공개 페이지 hero + 파일 bento + AI chat aside |

### 4) Moment Zoom (×3) 공통 구조
- **Section**: `min-h-[90vh]`, padding `12vh 32px`, grid 2-column (1fr 1fr), gap 64px, items center
- **Copy** (한쪽) + **Zoom card** (반대쪽, 최대 420-460px wide)
- `reverse` prop으로 좌우 뒤집기

각 zoom별:

| # | tag | title | zoom |
|---|------|-------|------|
| 02 | "Creation certificate" | "한 파일, 한 인증서." | ZoomCertificate — 큰 인증서 카드, hash/at/size/by/sig 5개 행 (mono font, 컬러별 강조), Verified/Public proof/Inline citation pills |
| 04 | "Readiness" | "제출 가능한 상태인가요?" (`reverse`) | ZoomReadiness — 큰 원형 게이지 (SVG, conic-grad stroke) + 4-체크리스트 (Story/Evidence/AI/Link) |
| 06 | "Live link" | "한 줄의 링크. 살아있는 페이지." | ZoomShare — 발급 모달, link copy field, 라이브/공유 CTA 2-col, verified/AI/SEO pills |

### 5) Capabilities
- 4-card grid (`auto-fit, minmax(240px, 1fr)`)
- 각 카드: 22px padding, rounded-2xl, border-white/10, bg-[#0b1020]/70, backdrop-blur
- 아이콘 (lucide): `Files`, `MessageSquareText`, `Fingerprint`, `ShieldCheck`
- Hover: border-violet-500/40, bg 진해짐

### 6) Gallery
- 3-card grid (`auto-fit, minmax(320px, 1fr)`)
- 각 카드:
  - **Cover** (200px tall): radial gradients가 겹쳐진 mesh (포트폴리오마다 다른 컬러)
  - 상단 pills (verified/AI/Live), 우하단 share link mono badge
  - **Body**: tag eyebrow → title h3 → desc → avatar+author → stats grid (Files/AI/Views) → 'Live page' link
- Hover: `translateY(-4px)`, border-violet-500/45

### 7) Final CTA
- Big rounded box (28px radius), padding 72px 48px
- 그라데이션 배경 + 별도 conic-gradient aurora overlay
- Pill (cyan): "Free during beta · 5분 안에 첫 포트폴리오"
- H2: "지금 가진 파일이 / 당신의 다음 합격이 됩니다." (마지막 줄 gradient)
- 2개 CTA: primary `지금 시작하기 →` + outline `샘플 페이지 보기`
- Trust row: 신용카드 불필요 · 1GB 무료 저장 · SHA-256 인증 · 모든 파일 암호화

### 8) Footer
- Logo + 한 줄 카피 + 4개 링크 (가이드/가격/회사/개인정보) + 카피라이트

---

## 인터랙션 / 동작

1. **Sticky TopNav** — 상단 sticky, backdrop-blur, scroll에 따라 z-50 유지
2. **Scroll reveal** — 모든 섹션 헤더/카드는 IntersectionObserver로 진입 시 opacity 0→1, translateY/Scale 진입
3. **Hero shimmer** — 헤드라인 두 번째 줄은 무한 shimmer
4. **Halo glow** — 각 mockup 뒤 conic-gradient halo
5. **Mockup 내부 미니 모션**:
   - `MockOrganize`: 카테고리 카드 spring-in, 안 파일들이 차례로 slide-up + checkmark
   - `MockStory`: 5섹션 slide-up 순차 등장
   - `MockReview`: rubric 막대가 0% → 값으로 width 트랜지션 (1.4s, stagger)
   - `MockVisitor`: AI 답변 bubble에 `answer-reveal` (clip-path inset)
   - `ZoomCertificate`: 인증서 5행이 0.12s stagger로 등장
   - `ZoomReadiness`: SVG 게이지 stroke-dasharray가 0 → 87/100으로 차오름 (2s)
   - `ZoomShare`: spring-in entry
6. **Gallery card hover** — translateY -4px, border violet
7. **Mobile** — 현재 디자인은 desktop-first (`lg:grid-cols-2` 등 응용). 모바일 우선순위 떨어지지만 적어도 1-column으로 무너지게.

---

## 카피 (한국어 완전판)

모든 카피는 **`source/app/sections-1.jsx`, `source/app/sections-2.jsx`, `source/app/moments.jsx`, `source/app/mockups-*.jsx`, `source/app/zooms.jsx`** 안에서 그대로 추출하시면 됩니다.

---

## State management

- 거의 stateless. `useState`는 다음 정도만 필요:
  - 각 섹션의 `visible` (IntersectionObserver 결과)
  - 호버 트래킹 (필요시)
- 데이터는 정적. API 호출 없음.

---

## 사용된 lucide 아이콘 목록

`lucide-react`에서 import:

```ts
import {
  ArrowRight, ArrowUpRight, ArrowLeft, ArrowDown,
  Bot, Sparkles, MessageSquareText, Send,
  FileCheck2, FileStack, Files, FileText, Archive, Image, Folder, Video,
  Fingerprint, ShieldCheck, CheckCircle2, Circle,
  UploadCloud, Globe2, BriefcaseBusiness, UserRound,
  Plus, Copy, Eye, Link2, ExternalLink, Share2, Download, Heart,
  Palette, Layers, Wand2, PlayCircle,
  ClipboardCheck, Hash, Gauge, Award, Trophy, BarChart3,
} from 'lucide-react'
```

(HTML 프로토타입에서는 손으로 SVG path를 다시 그렸지만, 코드베이스에서는 그냥 `lucide-react` import 하세요.)

---

## Files in this bundle

```
source/
├── Landing.html                  # 전체 페이지를 띄우는 엔트리. 가장 먼저 봐주세요.
├── styles/foliosage.css          # 토큰 + keyframe + 헬퍼 클래스 (코드베이스의 globals.css와 거의 동일)
├── tweaks-panel.jsx              # Tweaks 패널 (production 옮길 때 무시 가능)
└── app/
    ├── icons.jsx                 # 손-traced lucide 아이콘 (코드베이스에서는 lucide-react 사용)
    ├── primitives.jsx            # Pill, Eyebrow, Btn, Card, FrameChrome, StatTile, useReveal, useScrollProgress
    ├── mockups-1.jsx             # MockDashboard, MockCreate, MockUpload, MockOrganize, MockStory
    ├── mockups-2.jsx             # MockReadiness, MockReview, MockPublish, MockVisitor, MockStats
    ├── zooms.jsx                 # ZoomCertificate, ZoomReadiness, ZoomShare
    ├── sections-1.jsx            # Hero, ScrollStory (사용 안 함), Capabilities
    ├── sections-2.jsx            # Gallery, FinalCTA, Footer
    ├── moments.jsx               # ★ 핵심. 7-모먼트 구성 (Moments 컴포넌트가 모든 hero/zoom 조립)
    └── main.jsx                  # App 진입점
```

**가장 중요한 두 파일**:
1. `app/moments.jsx` — 7-모먼트 구조의 source of truth
2. `app/mockups-1.jsx` + `mockups-2.jsx` + `zooms.jsx` — 각 모먼트가 사용하는 미니 제품 화면들

---

## Reference: codebase 파일들과의 매핑

랜딩 디자인이 참조한 실제 제품 화면 (코드베이스에 이미 있는 것 — 미니 mockup은 이걸 단순화한 거):

- **MockDashboard** ← `app/dashboard/page.tsx`
- **MockUpload** ← `components/FileUploadZone.tsx`
- **MockOrganize** ← `components/OrganizeStatus.tsx`
- **MockStory / MockReview** ← `components/DefenseRoom.tsx`
- **MockVisitor** ← `app/p/[shareCode]/ShareLinkClient.tsx`
- **MockStats** ← (해당 페이지 없음. AI Guide stats panel 일부 + certificate 컨셉을 합성)

랜딩에서 보이는 미니 화면들은 실제 제품의 본질만 압축한 것이라, **그대로 베끼지 말고 위 컴포넌트의 시각 어휘를 빌려와 압축된 버전을 만들어주세요**. 또는 더 야심차게는, **실제 컴포넌트를 작은 스케일로 import해서 demo data로 채워 보여주는** 방식도 가능합니다 (실제 동작과 100% 일치하는 미리보기가 된다는 장점).

---

## 작업 순서 제안

1. `app/page.tsx`를 새 구조로 swap. 일단 빈 섹션들로 뼈대.
2. Hero + MomentsIntro + Capabilities + Gallery + FinalCTA + Footer 정적 부분 먼저.
3. 4개 hero mockup 컴포넌트를 하나씩 추가 (`LandingMockOrganize` 등). 우선 정적 mockup으로.
4. 3개 zoom 컴포넌트 추가.
5. IntersectionObserver-기반 reveal 훅 추가.
6. Mockup 내부 미니 모션 (게이지 채우기, rubric bar, answer-reveal 등).
7. 모바일 1-column fallback.

---

## 질문이 생기면

`source/Landing.html`을 브라우저로 열어서 실제 동작 확인 가능. 모든 디자인 결정은 그 파일에 들어있습니다.
