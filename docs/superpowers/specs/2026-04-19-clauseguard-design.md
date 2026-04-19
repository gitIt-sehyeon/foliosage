# ClauseGuard — Design Spec

**Date:** 2026-04-19  
**Competition:** NURIE.AI Visionary AI 2026 Cross-Platform Innovation Awards  
**API:** VaultSage Server-side API

---

## 1. Overview

ClauseGuard is a web-based AI contract reviewer targeting startup founders and non-legal users. Users upload contracts (PDF/DOCX), and the app uses the VaultSage API to extract risk items, generate plain-language summaries, and suggest negotiation language for unfavorable clauses — all without retaining sensitive document data.

**Core value proposition:** "Protect yourself from bad contracts — without a lawyer."  
VaultSage's no-data-retention architecture directly addresses founders' concern about uploading sensitive IP-containing contracts to AI services.

---

## 2. Target Users

- Startup founders and early-stage operators
- Non-legal professionals who regularly sign NDAs, vendor agreements, SaaS subscriptions, employment contracts
- Language: Korean and English

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router, TypeScript) |
| Backend | Spring Boot (Java) |
| Database | PostgreSQL (AWS RDS) |
| File Storage | AWS S3 |
| Authentication | Spring Security + JWT |
| VaultSage Integration | Spring WebClient |
| Frontend Deployment | Vercel |
| Backend Deployment | AWS Elastic Beanstalk |

---

## 4. Features

### 4.1 Contract Upload & Analysis
- Accept PDF and DOCX files
- Upload file to S3, then call VaultSage API from Spring backend
- Extract: overall risk score, plain-language summary, per-clause risk level
- Generate negotiation suggestion text per risky clause (KO + EN)
- Store results in DB; display in frontend

### 4.2 Clause-level Negotiation Suggestions
- Each clause tagged: LOW / MEDIUM / HIGH risk
- High/medium risk clauses show: original text, risk explanation, suggested replacement text
- Suggestions available in both Korean and English

### 4.3 Version Comparison
- Upload a revised version of the same contract
- Side-by-side diff view of changed clauses
- Re-analysis of new version via VaultSage API
- Visual indicators for: added / removed / modified / risk-changed clauses

### 4.4 History Management
- Dashboard lists all analyzed contracts with date, risk score, title
- Search and filter by title, date, risk level
- Delete contract (removes S3 file + DB records)

### 4.5 Team Workspace
- Create named workspaces; invite members by email
- Roles: owner / editor / viewer
- Workspace members share contract history and analysis results
- Comments per clause (threaded, editor+ only)

### 4.6 Share Links
- Generate a public share link for any analysis result
- Configurable expiry (1 day / 7 days / 30 days / never)
- Recipient can view analysis without logging in (read-only)

---

## 5. API Endpoints (Spring Boot)

```
# Auth
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/refresh

# Contracts
POST   /api/contracts                        # Upload + trigger VaultSage analysis
GET    /api/contracts                        # List (paginated)
GET    /api/contracts/{id}                   # Analysis result
DELETE /api/contracts/{id}

# Versions
POST   /api/contracts/{id}/versions          # Upload new version
GET    /api/contracts/{id}/versions/compare?v1=1&v2=2

# Workspaces
POST   /api/workspaces
POST   /api/workspaces/{id}/invite
GET    /api/workspaces/{id}/contracts
GET    /api/workspaces/{id}/members
DELETE /api/workspaces/{id}/members/{userId}

# Share Links
POST   /api/contracts/{id}/share
GET    /api/share/{token}
```

---

## 6. Database Schema

```sql
users (
  id UUID PK,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  name VARCHAR,
  preferred_lang ENUM('ko','en') DEFAULT 'ko',
  created_at TIMESTAMP
)

workspaces (
  id UUID PK,
  name VARCHAR,
  owner_id UUID FK users,
  created_at TIMESTAMP
)

workspace_members (
  workspace_id UUID FK workspaces,
  user_id UUID FK users,
  role ENUM('owner','editor','viewer'),
  PRIMARY KEY (workspace_id, user_id)
)

contracts (
  id UUID PK,
  workspace_id UUID FK workspaces,
  uploader_id UUID FK users,
  title VARCHAR,
  created_at TIMESTAMP
)

contract_versions (
  id UUID PK,
  contract_id UUID FK contracts,
  version_num INT,
  s3_key VARCHAR,
  created_at TIMESTAMP
)

analyses (
  id UUID PK,
  contract_version_id UUID FK contract_versions,
  status ENUM('pending','processing','done','failed'),
  risk_score INT,        -- 0-100
  summary_ko TEXT,
  summary_en TEXT,
  raw_json JSONB,
  created_at TIMESTAMP
)

clauses (
  id UUID PK,
  analysis_id UUID FK analyses,
  clause_index INT,
  original_text TEXT,
  risk_level ENUM('low','medium','high'),
  explanation_ko TEXT,
  explanation_en TEXT,
  suggestion_ko TEXT,
  suggestion_en TEXT
)

share_links (
  id UUID PK,
  contract_id UUID FK contracts,
  token VARCHAR UNIQUE,
  expires_at TIMESTAMP
)
```

---

## 7. Frontend Pages (Next.js)

```
/                          # Landing page
/login                     # Login
/signup                    # Signup

/dashboard                 # Contract list + recent analyses
/contracts/new             # Upload page
/contracts/[id]            # Analysis result: risk summary + clause list
/contracts/[id]/compare    # Version diff view
/contracts/[id]/versions   # Version history

/workspace                 # Workspace list
/workspace/[id]            # Team contract list
/workspace/[id]/settings   # Member invite & management

/share/[token]             # Public share view (no login required)
```

---

## 8. VaultSage Integration Flow

1. User uploads file → Spring stores to S3
2. Spring calls VaultSage API with file reference or extracted text
3. VaultSage returns structured analysis (risk items, summaries, clause breakdown)
4. Spring parses response → saves to `analyses` + `clauses` tables
5. Frontend polls or receives result; renders risk dashboard

**Security:** VaultSage API key stored in Elastic Beanstalk environment variables only — never in code or frontend.

---

## 9. Error Handling

- VaultSage API failure: analysis status set to `failed`, user shown retry option
- File upload failure: S3 error surfaced with user-friendly message
- Share link expired: 410 Gone response with clear expiry message
- Unsupported file type: rejected at frontend before upload

---

## 10. Out of Scope

- Mobile app
- Languages other than Korean and English
- Real-time collaborative editing
- Payment / subscription tiers
