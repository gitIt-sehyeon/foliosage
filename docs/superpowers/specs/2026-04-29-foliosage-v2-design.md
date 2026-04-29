# FolioSage v2 — Full Enhancement Design Spec

**Date:** 2026-04-29  
**Status:** Approved  
**Scope:** Bug fixes + UI redesign + new features

---

## 1. Design System

### Visual Theme: Dark Premium
- Background: `#0f172a` (page), `#1e293b` (card), `#080e1a` (sidebar)
- Accent: `#6d28d9` (primary), `#a78bfa` (light), `#4f46e5` (secondary)
- Text: `#ffffff` (title), `#94a3b8` (body), `#475569` (muted)
- Success: `#34d399` | Warning: `#fbbf24` | Danger: `#f87171`
- Border: `#334155` (default), `#1e293b` (subtle)

### Animation System (applies to ALL pages)
| Type | Usage | Easing |
|------|-------|--------|
| **Aurora** | Hero/banner backgrounds — gradient slowly shifts | `ease infinite 8s` |
| **Shimmer** | Heading text — light sweeps across | `linear 3s infinite` |
| **Particles** | Hero sections — small purple dots float | `ease-in-out 3-5s infinite` |
| **Glow pulse** | Avatar, selected cards — purple border breathes | `ease-in-out 2.5s infinite` |
| **Spring slide-in** | Chat panel, modals, side panels | `cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s` |
| **Slide-up** | Cards, list items appearing | `ease 0.4-0.5s both` staggered |
| **Card hover** | Portfolio/file cards — lift + glow on hover | `cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s` |
| **Skeleton** | Loading states — shimmer sweep | `linear 1.5s infinite` |
| **Count-up** | Stats numbers on page load | `ease 0.6s staggered` |

---

## 2. Bug Fixes

### 2-A. AI Organization Pipeline Fix
**Problem:** `OrganizeService.runPipeline()` throws and sets status to `"failed"`. Root causes:
1. Files may still be processing in VaultSage when pipeline starts
2. Status stored in `ConcurrentHashMap` (lost on server restart)
3. Insufficient error logging — impossible to tell which step failed

**Fix:**
1. **File readiness check** — before `runPipeline`, poll `VaultSageService.getProcessingStatus()` for each file until all are `"completed"` (max 5 min timeout)
2. **DB persistence** — add `organizeStatus VARCHAR` and `organizeCompletedAt TIMESTAMP` columns to `portfolio` table; persist status on every transition
3. **Error logging** — log the full exception with step name at ERROR level so failures are diagnosable
4. **Frontend** — on page load, read status from DB instead of in-memory map; survives server restart

### 2-B. PDF Viewer Fix
**Problem:** `VaultSageService.streamPreviewAnonymous()` returns a PNG preview, not actual PDF bytes. Backend serves it with `application/pdf` content type → browser shows "Preview not available."

**Fix:**
- Add `VaultSageService.downloadFile(fileId)` — calls `POST /api/v1/files/download` with the server API key (server-to-server, no user auth needed)
- Add `GET /api/public/{shareCode}/files/{fileId}/raw?download=false` endpoint in `PublicController` that calls `downloadFile` and streams the response with correct MIME type
  - `?download=false` (default): `Content-Disposition: inline` — used by the PDF iframe viewer
  - `?download=true`: `Content-Disposition: attachment; filename="..."` — used by the download button
- Frontend uses `<iframe src="...raw">` for PDFs (browser renders natively, full scroll support)

---

## 3. New Features

### 3-A. File Deletion
**Backend:**
- `DELETE /api/portfolios/{id}/files/{fileId}` in `PortfolioController`
- `PortfolioService.deleteFile(userEmail, portfolioId, fileId)`:
  1. Ownership check
  2. Call VaultSage `POST /api/v1/files/delete` with `file_ids: [vaultsageFileId]`
  3. Delete `PortfolioFile` record from DB

**Frontend:** Red `🗑️ 삭제` button on each file card in management page. Confirm dialog before deletion.

### 3-B. File Descriptions
**Backend:**
- Add `description VARCHAR(500)` column to `portfolio_file` table
- `PATCH /api/portfolios/{id}/files/{fileId}` — updates description field
- `PortfolioResponse.PortfolioFileDto` includes `description`

**Frontend:**
- Management page: inline edit field below filename on each file card (click to edit, blur to save)
- Share link page: description shown below filename in bottom file strip

### 3-C. Visitor Download Button
**Backend:**
- `GET /api/public/{shareCode}/files/{fileId}/raw` (same endpoint as PDF fix above) handles all file types
- Already covered by 2-B fix; no additional backend work

**Frontend:**
- `↓ 다운로드` button in share link page header bar
- Downloads currently selected file via the `/raw` endpoint with `Content-Disposition: attachment`

### 3-D. Visitor Statistics
**Backend:**
- Add `viewCount INT DEFAULT 0` column to `portfolio` table
- Increment on every `GET /api/public/{shareCode}` call (best-effort, non-blocking)
- Add `downloadCount INT DEFAULT 0` — increment on `/raw` download requests
- Expose via `GET /api/portfolios/{id}/stats` (authenticated) returning `{ viewCount, downloadCount, todayViews }`
- `todayViews`: query via VaultSage `GET /api/v1/share/access-logs/{shareId}` and count today's entries (best-effort: if VaultSage returns error, return 0)
- View/download increment is fire-and-forget (async `@Async`, does not slow down the response)

**Frontend:**
- Portfolio management page sidebar: three stat badges (총 조회, 오늘, 다운로드)
- Share link page header: `👁 N views` badge (read-only, visible to visitors)
- Count-up animation on page load

### 3-E. User Profile Page
**Route:** `/u/[username]`

**Backend:**
- Add `username VARCHAR(50) UNIQUE`, `bio VARCHAR(300)`, `location VARCHAR(100)`, `linkedinUrl VARCHAR(255)`, `githubUrl VARCHAR(255)` columns to `user` table
- `GET /api/public/users/{username}` — returns user profile + list of published portfolios
- `PATCH /api/users/me/profile` — authenticated, updates bio/location/links/username

**Frontend:**
- `/u/[username]/page.tsx` — public profile page
  - **Hero section**: aurora background + particles, avatar (gradient square with initials — no photo upload) with glow, shimmer name, bio, external links
  - **Stats row**: portfolio count + total views (slide-up staggered)
  - **Portfolio grid**: 2-column card grid, each card has aurora preview area + title + tags + view count. Spring hover lift.
- Dashboard: profile edit section (username, bio, location, links)
- Nav bar: link to own profile page

### 3-F. OG Meta Tags
**Backend:**
- `GET /api/public/{shareCode}/og` — returns JSON `{ title, description, imageUrl }` for share link
- `GET /api/public/users/{username}/og` — same for profile page

**Frontend (Next.js):**
- Share link page (`/p/[shareCode]`): `generateMetadata()` server function fetches portfolio and sets `og:title`, `og:description`, `og:image` (first file preview), `twitter:card`
- Profile page (`/u/[username]`): same pattern

---

## 4. UI Redesign — Page by Page

### 4-A. Share Link Page (`/p/[shareCode]`)
**Layout:**
- Top bar: `FolioSage` wordmark | portfolio title + owner | `👁 N views` badge | `↓ 다운로드` | `💬 AI 채팅` toggle | `≡ 파일` toggle
- Center: fullscreen PDF/image viewer (iframe for PDF, img for images). Page indicator overlay.
- Right panel (slide-in): AI chat — spring animation in/out on button toggle. Shows chat history, input box.
- Bottom strip: horizontal file list — each chip shows file icon + name + description. Selected chip highlighted with glow.
- Certificates: accessible via button, renders in a modal or collapsible section

**Animations:** Aurora on top bar background, spring slide for chat panel, skeleton while PDF loads, glow on selected file chip.

### 4-B. Portfolio Management Page (`/portfolios/[id]`)
**Layout — Sidebar + Main Grid:**
- **Left sidebar** (`~220px`): portfolio title + publish badge | stat boxes (총 조회, 오늘, 다운로드) | AI organization panel (status + category tree + re-run button) | quick links (public link copy, profile, certificates)
- **Right main**: compact upload zone at top | file 2×2 grid — each card has emoji icon, filename, inline description field, 🗑️ delete button (top-right)

**Animations:** Count-up on stats, slide-up stagger on file cards, spring bounce on delete confirm, aurora subtle on sidebar background.

### 4-C. Profile Page (`/u/[username]`)
**Layout — Centered, max-width 800px:**
- **Hero banner**: aurora + particles background, avatar with glow pulse, shimmer name, job title, bio, external link chips
- **Stats row**: portfolio count + total views (slide-up staggered on mount)
- **Portfolio grid**: 2-column cards — aurora preview area, title, description, tag badges, view count. Spring hover lift + glow border.
- **Footer**: "FolioSage로 만들기 →" CTA with shimmer text

### 4-D. Global
- Skeleton loading on all data-fetching pages
- All list items slide-up with 80-150ms stagger
- All interactive cards get spring hover (translateY -4px + scale 1.02 + glow border)
- Buttons get subtle scale(0.97) on press

---

## 5. Data Model Changes

| Table | Change |
|-------|--------|
| `portfolio` | Add `organize_status VARCHAR(20)`, `organize_completed_at TIMESTAMP`, `view_count INT DEFAULT 0`, `download_count INT DEFAULT 0` |
| `portfolio_file` | Add `description VARCHAR(500)` |
| `user` | Add `username VARCHAR(50) UNIQUE`, `bio VARCHAR(300)`, `location VARCHAR(100)`, `linkedin_url VARCHAR(255)`, `github_url VARCHAR(255)` |

---

## 6. API Changes Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `DELETE` | `/api/portfolios/{id}/files/{fileId}` | File deletion |
| `PATCH` | `/api/portfolios/{id}/files/{fileId}` | Update file description |
| `GET` | `/api/portfolios/{id}/stats` | Visitor stats (auth) |
| `GET` | `/api/public/{shareCode}/files/{fileId}/raw` | Stream actual file bytes |
| `PATCH` | `/api/users/me/profile` | Update user profile |
| `GET` | `/api/public/users/{username}` | Public user profile + portfolios |

---

## 7. Out of Scope
- Password-protected portfolios (VaultSage supports it but deferred)
- Portfolio reordering (drag-and-drop)
- File upload progress bar (nice-to-have, deferred)
- Email notifications
