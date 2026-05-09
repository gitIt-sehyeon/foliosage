# FolioSage Design System — Implementation Spec

**Date:** 2026-05-09  
**Source:** Anthropic Design bundle `h/A5r0tlDLuxAcoAWRPV-MtQ`  
**Scope:** All five screens (Public Portfolio, Portfolio Detail, Dashboard, Landing, Auth)

---

## 1. Design System Tokens

All screens share a single token set. Tokens are already partially applied in `globals.css` and Tailwind classes; this spec locks them down.

**Surfaces (dark-first):**
- Page void: `#060912`
- Deep chrome (nav, panels): `#070b15`
- Card: `#0b1020` / `bg-[#0b1020]/90`
- Card hover: `#111827`
- Selected/tinted: `#1e0a3c`

**Brand palette:**
- Violet primary: `#6d28d9` fill, `#7c3aed` hover, `#8b5cf6` active
- Cyan accent: `#67e8f9` / `#a5f3fc`
- Amber tertiary: `#f59e0b` / `#fde68a`
- Emerald success: `#34d399` / `#6ee7b7`

**Aurora background (every full-page surface):**
```
base: #060912
grid: linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px) 44px×44px (both axes)
blobs: radial-gradient violet@18%18%, cyan/teal@80%22%, amber@56%86% — all ~24-28% fade
vignette: linear-gradient(135deg, rgba(15,23,42,0.25), rgba(6,9,18,0.92) 48%, rgba(6,9,18,0.65))
```

**Card anatomy:**
```
rounded-2xl border border-white/10 bg-[#0b1020]/90 backdrop-blur-xl shadow-2xl shadow-black/30
```
Hover: border flips to `border-[#6d28d9]/70`, bg to `#111827`.

**Typography:** Inter (loaded via `next/font`). Key classes already in globals:
- `animate-shimmer-text` — hero headline word
- `animate-spring-in` — modal/card entry
- `animate-slide-up` — staggered list entry
- `animate-aurora` — aurora background pan

**Eyebrows:** `text-[11px] font-medium uppercase tracking-[0.24em–0.28em] text-cyan-300` (or `text-slate-500` for muted).

**Status pills:** inline-flex, `rounded-full`, tinted bg + border by semantic color:
- `emerald` → Story ready / Published / Verified
- `amber` → Needs story / Caution
- `violet` → AI reviewed / Organizing
- `cyan` → Published / AI chat

---

## 2. Landing Page (`app/page.tsx`)

**Status:** ~95% matching. Minor delta only.

**Changes:**
- Confirm `animate-shimmer-text` is applied to the hero span (already done).
- Confirm the aurora blob radials match the token spec above (already done).
- No structural changes needed.

---

## 3. Dashboard (`app/dashboard/page.tsx`)

**Status:** Close. One structural gap.

**Changes:**
- Wrap `<nav>` content in `max-w-7xl mx-auto` so it centers like the design (currently full-width flex).
- Everything else — workspace overview card, status sidebar, portfolio grid, tab switcher — already matches the design.

---

## 4. Auth — Login (`app/login/page.tsx`) and Signup (`app/signup/page.tsx`)

**Current:** Single-column centered card.  
**Design:** Two-column layout (`1fr 440px`, aligned center, `min-height: calc(100vh - 84px)`).

**Left column (new):**
- Eyebrow: `CREATOR WORKSPACE`
- H1: "Return to your living portfolio." (login) / "Start building your evidence portfolio." (signup)
- Subtext paragraph
- Three feature-bullet rows: icon + text, each as a rounded-xl inset card (`border border-white/10 bg-white/[0.035]`). Icons: `Bot`, `FileCheck2`, `Fingerprint`.

**Right column (existing form, enhanced):**
- Wrap in `<Card className="fs-anim-spring-in">` with `p-8`.
- "Welcome back" in `text-violet-200` above the h2.
- Subtitle in `text-slate-500`.
- Inputs: existing style (`bg-white/[0.04] border-white/10 focus:border-[#6d28d9]`).
- Primary CTA: white button with arrow icon.
- `또는` divider (already exists in login).
- Google OAuth: outline button with inline Google G SVG.
- Footer text: "No account? Sign up" / "Already have one? Sign in" link in `text-violet-200`.

**Aurora + void background** applies to the full page (`Stage` pattern).

---

## 5. Portfolio Detail (`app/portfolios/[id]/page.tsx`)

**Current:** Sidebar (296px) + scrollable main content.  
**Design:** Full-page, no sidebar. Hero banner → tab bar → two-column body.

### 5a. Remove sidebar, keep all functionality

The sidebar currently holds: portfolio title/status, stats (views/downloads/today), AI organize status+button, and publish/share links. These move:
- **Publish/share** → Navbar right (`공유 링크` + `라이브 페이지 열기` buttons)
- **Stats** → Hero banner (compact stat row)
- **AI organize** → right column card under tabs
- **Portfolio title/status** → Hero banner headline

### 5b. Hero banner

Full-width card at top, `rounded-2xl`, gradient background:
```
linear-gradient(140deg, rgba(124,58,237,0.30) 0%, rgba(11,16,32,0.85) 38%, rgba(11,16,32,0.95) 70%),
radial-gradient(circle at 88% 12%, rgba(34,211,238,0.30), transparent 40%)
```
Two-column flex (`flex-1 min-w-[520px]` + `flex-[0_0_320px]`):

**Left:** Status pills row → Eyebrow (share link) → H1 (gradient clip, 56px) → subtitle → CTAs (라이브 페이지 열기 primary, 편집 모드 outline, 공유 ghost).

**Right (AI preview chip):** Small card showing AI Guide readiness status. No "last answer" API exists; instead show: file count + embed status text derived from `portfolio.story` and `readiness`; a full progress bar if AI review is ready, partial if not; and the `Bot` icon. Same panel dimensions as in design: `border border-white/10 bg-[#0b1020]/65 backdrop-blur-xl rounded-2xl p-[18px]`.

### 5c. Tab bar

`Story | 파일 | 활동` — pill-button tab bar (`bg-[#0b1020]/90 border border-white/10 rounded-xl p-1 w-fit`). Active tab: `bg-white/[0.08] text-white`. Inactive: `text-slate-500`.

### 5d. Body: two columns (`1fr 360px`)

**Left column by tab:**

- **Story tab:** The existing story fields (summary, role, problem, solution, impact) reformatted as stacked cards with the `01 / 02 / 03` mono-number prefix and cyan eyebrow label. Generate Story + Save buttons remain.
- **파일 tab:** 2-column file grid. Each card: `FileCheck2` icon with tinted bg, filename, kind + size + hash. Upload CTA card with dashed border. Delete confirm modal stays.
- **활동 tab:** Activity log list — icon + text + timestamp. No dedicated activity API exists yet; derive entries from fields already in the portfolio response: organize status (last run), story `generatedAt`, and `createdAt`. Show these as static rows with relative-time labels. If none are available, show an empty-state ("활동 기록이 없습니다.").

**Right column (always visible):**
- Meta summary card (Role, Files count, Updated, Share link).
- AI Guide status card (violet-gradient bg, file count + embed status, progress bar, "질문 시뮬레이션" CTA → opens DefenseRoom).
- Danger zone card (unpublish + delete buttons).

### 5e. Upload zone

FileUploadZone stays but moves to be a compact row at top of the 파일 tab content (not before it).

### 5f. What stays exactly as-is (no visual changes)

- All API calls (loadPortfolio, loadStats, publish, unpublish, deleteFile, saveDescription, generateStory, saveStory, pollOrganizeStatus)
- DefenseRoom component (opened via the "질문 시뮬레이션" button)
- Delete confirm modal
- CountUpNumber animation
- Loading skeleton screen

---

## 6. Public Portfolio Viewer (`app/p/[shareCode]/ShareLinkClient.tsx`)

**Current:** 64px top bar → two-panel file viewer → 104px bottom file strip.  
**Design:** 64px top bar → magazine article (scrollable) + sticky chat sidebar.

### 6a. Top bar (keep, minor update)

Keep all existing elements. Add `FolioSage 검증` emerald pill. Add `좋아요 · 24` ghost button placeholder (non-functional). Existing: download button, AI 리뷰 button, AI 채팅 button.

### 6b. Layout switch

Remove the current grid with `minmax(0,1fr) minmax(320px,380px)` chat column. New structure:

```
<main style={{ display: 'grid', gridTemplateColumns: chatOpen ? '1fr 400px' : '1fr' }}>
  <article> {/* scrollable magazine content */} </article>
  {chatOpen && <aside> {/* sticky chat panel */} </aside>}
</main>
```

### 6c. Magazine article (left column)

Scrollable, `padding: 40px 32px 140px`, max-width 880px centered.

**Magazine hero:**
- Pill row: `Live · date`, `AI reviewed`, `N verified`.
- Eyebrow: case + sprint info.
- H1: 76px, gradient-clip (`#fff → #ddd6fe → #67e8f9`), portfolio title, with italic last word in amber→pink→violet gradient.
- Lead paragraph: story summary.
- Author row: avatar gradient circle + name + role + read time + views.
- Hero artwork block: 360px tall, `rounded-2xl`, radial gradient mesh (violet+cyan+amber on dark base). Caption pill bottom-left, hash top-right.

**Story section:**
```
Eyebrow: "The story"
4 cards (Role / Problem / Approach / Outcome) — each with mono index `01`…`04`, cyan eyebrow label, body text.
Hoverable cards (border flips to violet on hover).
```

**Evidence bento grid:**
```
4-column grid, 110px auto-rows.
Each FileCard: tinted icon, filename, description.
span variants: wide (span 2 cols), tall (span 2 rows), sq (1×1).
Radial glow in corner matching file tone.
```

**Closing CTA section:**
```
rounded-2xl, border-violet-300/18, gradient bg.
Eyebrow + h2 "AI Guide에게 무엇이든 물어보세요".
Suggested question pills (from portfolio.story.interviewQuestions).
```

### 6d. Sticky chat sidebar (right column)

`position: sticky; top: 64px; height: calc(100vh - 64px)` — the existing `ChatPanel` component, wrapped in the new aside. Keep the spring-in transition. The existing `PublicDefensePanel` stays as an overlay triggered from the top bar.

### 6e. File viewing (modal adaptation)

Current implementation shows files inline. In the magazine layout, clicking an evidence card opens a **modal lightbox** (`fixed inset-0 bg-black/70 z-50`):
- PDF: `<iframe>` with the existing `pdfViewerUrl()`.
- Image: `<img>` with the existing `previewUrl()`.
- File metadata bar at bottom (hash, certified badge).
- Close button (X) top-right.

### 6f. Bottom file strip

Remove. The bento grid replaces file navigation.

---

## 7. Implementation Order

1. Design tokens audit in `globals.css` (add any missing keyframes/classes)
2. Landing — confirm only; no code change expected
3. Dashboard — nav centering
4. Auth (Login + Signup) — two-column layout
5. Portfolio Detail — hero + tabs (largest structural change in owner flows)
6. Public Portfolio Viewer — magazine layout + lightbox modal (largest structural change overall)

---

## 8. Out of Scope

- New backend endpoints (no API changes)
- The `ProfileClient.tsx` (public user profile page) — not shown in this design
- The `DefenseRoom` and `ChatPanel` component internals
- Any light-mode support (design is dark-first only)
