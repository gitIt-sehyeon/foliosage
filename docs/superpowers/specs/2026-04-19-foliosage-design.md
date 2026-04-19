# FolioSage — Design Spec

**Date:** 2026-04-19
**Competition:** NURIE.AI Visionary AI 2026 Cross-Platform Innovation Awards
**API:** VaultSage Server-side API

---

## 1. Overview

FolioSage is a web-based AI portfolio platform for creators (designers, developers, artists). Creators upload their work, VaultSage's Smart Organizer automatically categorizes files by project, and a public portfolio link lets visitors browse a gallery and chat with an AI that explains the work based on the actual files. Each uploaded file receives a SHA-256 + timestamp creation certificate as proof of authorship.

**Core value proposition:** "Your portfolio talks back — and proves it's yours."

---

## 2. Target Users

- Designers, developers, artists, and all creators
- Visitors: recruiters, clients, collaborators
- Language: Korean and English

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) → Vercel |
| Backend | Spring Boot 3 (Java 21) → AWS Elastic Beanstalk |
| Database | PostgreSQL (AWS RDS) |
| File Storage & AI | VaultSage API (files, smart-organizers, chat, share) |
| Authentication | Spring Security + JWT |
| Certificate PDF | Apache PDFBox |

---

## 4. Features

### 4.1 Portfolio Creation
- Creator creates a portfolio → backend creates a VaultSage Smart Organizer instance
- Upload files (any type) → stored via `POST /api/v1/files/`
- PNG preview auto-generated via `png-preview-reprocess`
- SHA-256 hash computed server-side → stored in `portfolio_files`

### 4.2 AI Auto-Organization (Smart Organizer Pipeline)
- `POST /smart-organizers/{id}/generate` → AI analyzes files, suggests project structure
- Poll `generate/status` until complete
- `POST /smart-organizers/{id}/apply` → apply AI assignments
- `POST /smart-organizers/{id}/materialize` → finalize directory tree
- Creator can view and confirm the organized tree

### 4.3 Public Portfolio (Gallery + Chat)
- `POST /share/` → generates a public shareCode
- Visitor opens `/p/{shareCode}` — no login required
- Left panel: file gallery using PNG previews
- Right panel: AI chat via `POST /chat/public` with the portfolio files as context
- Chat history persisted via `GET /chat/public/history`

### 4.4 Creation Certificates
- Per-file certificate: file name, SHA-256 hash, upload timestamp, VaultSage file ID
- PDF generated via Apache PDFBox and downloadable
- Displayed as a badge on the public portfolio page

### 4.5 Visitor Analytics
- `GET /share/access-logs/{share_id}` → who visited, when, how many times
- Displayed in the creator's portfolio management page

---

## 5. Spring Boot API Endpoints

```
# Auth
POST /api/auth/signup
POST /api/auth/login

# Portfolios
POST   /api/portfolios
GET    /api/portfolios
GET    /api/portfolios/{id}
DELETE /api/portfolios/{id}

# Files
POST   /api/portfolios/{id}/files
GET    /api/portfolios/{id}/organize/status

# AI Organization
POST   /api/portfolios/{id}/organize

# Publishing
POST   /api/portfolios/{id}/publish
GET    /api/portfolios/{id}/visitors

# Certificates
GET    /api/portfolios/{id}/certificates
GET    /api/portfolios/{id}/certificates/{fileId}/download

# Public (no auth)
GET    /api/public/{shareCode}
POST   /api/public/{shareCode}/chat
GET    /api/public/{shareCode}/chat/history
```

---

## 6. Database Schema

```sql
users (
  id UUID PK,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  name VARCHAR,
  bio TEXT,
  vaultsage_token VARCHAR,
  created_at TIMESTAMP
)

portfolios (
  id UUID PK,
  user_id UUID FK users,
  title VARCHAR,
  description TEXT,
  organizer_id VARCHAR,       -- VaultSage smart-organizer ID
  share_code VARCHAR UNIQUE,  -- VaultSage share code
  vaultsage_share_id VARCHAR,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

portfolio_files (
  id UUID PK,
  portfolio_id UUID FK portfolios,
  vaultsage_file_id VARCHAR,
  name VARCHAR,
  file_hash VARCHAR,
  file_size BIGINT,
  mime_type VARCHAR,
  certified_at TIMESTAMP,
  created_at TIMESTAMP
)

certificates (
  id UUID PK,
  file_id UUID FK portfolio_files UNIQUE,
  pdf_path VARCHAR,
  issued_at TIMESTAMP
)
```

---

## 7. Frontend Pages

```
/                     Landing page
/login                Login
/signup               Signup

/dashboard            My portfolio list
/portfolios/new       Create portfolio

/portfolios/[id]      Portfolio management
                      - File upload
                      - AI organize status
                      - Tree view
                      - Publish + visitor log
                      - Certificate download

/p/[shareCode]        Public portfolio (no login)
                      - Left: file gallery (PNG preview)
                      - Right: AI chat
                      - Bottom: certificate badges
```

---

## 8. VaultSage Integration Flow

```
[Upload]
1. POST /api/v1/files/               → get vaultsage_file_id
2. POST /api/v1/files/processing-status → wait for processing
3. SHA-256 hash computed → save to portfolio_files
4. POST /api/v1/files/png-preview-reprocess → generate preview

[Organize]
5. POST /smart-organizers/{id}/generate
6. GET  /smart-organizers/{id}/generate/status  (poll)
7. POST /smart-organizers/{id}/apply
8. GET  /smart-organizers/{id}/apply/progress   (poll)
9. POST /smart-organizers/{id}/materialize

[Publish]
10. POST /share/  → shareCode
11. Save shareCode to portfolios table

[Visitor Chat]
12. POST /chat/public  (with shareCode + file context)
13. GET  /chat/public/history

[Analytics]
14. GET /share/access-logs/{share_id}
```

---

## 9. Error Handling

- VaultSage API failure during organize: status set to `failed`, retry button shown
- File type unsupported for PNG preview: show file icon fallback
- Share link not found: 404 with friendly message
- Chat unavailable: fallback message shown in chat panel

---

## 10. Out of Scope

- Mobile app
- Video file preview
- Real-time collaborative editing
- Payment / subscription tiers
