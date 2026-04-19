# FolioSage

> The AI-powered portfolio platform where your work speaks for itself

[![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AWS](https://img.shields.io/badge/AWS-Elastic_Beanstalk-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![VaultSage](https://img.shields.io/badge/VaultSage-API-6366F1?style=flat-square)](https://vaultsage.ai/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## About

**FolioSage** is an AI-powered portfolio platform for creators — designers, developers, and artists.

Upload your work and VaultSage AI automatically organizes files by project. Share a public link and let visitors browse your gallery and **chat directly with an AI** that explains your work based on the actual files. Every uploaded file receives an auto-generated **creation certificate** backed by SHA-256 hash and timestamp.

> "Your portfolio talks back — and proves it's yours."

* * *

## Features

- **AI Auto-Organization** — VaultSage Smart Organizer automatically categorizes uploaded files by project
- **Portfolio AI Chat** — Visitors browse your gallery and ask questions ("What was the hardest part of this project?")
- **Public Portfolio Link** — Shareable gallery + chat page accessible without login
- **Creation Certificates** — Per-file SHA-256 hash + timestamp PDF issued automatically
- **Visitor Analytics** — See who visited your portfolio, when, and how many times
- **Korean / English** support

* * *

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Creator / Visitor                     │
└──────────────────┬─────────────────────┬────────────────┘
                   │                     │
          ┌────────▼────────┐   ┌────────▼────────┐
          │   Next.js 14    │   │  /p/{shareCode} │
          │   (Vercel)      │   │  Public Page    │
          └────────┬────────┘   └────────┬────────┘
                   │                     │
          ┌────────▼─────────────────────▼────────┐
          │         Spring Boot (Java 17)          │
          │         AWS Elastic Beanstalk          │
          └──────┬──────────────────┬─────────────┘
                 │                  │
    ┌────────────▼──────┐  ┌────────▼────────────────┐
    │   PostgreSQL      │  │     VaultSage API        │
    │   (AWS RDS)       │  │  files / smart-organizers│
    │   users           │  │  chat / share            │
    │   portfolios      │  └─────────────────────────┘
    │   certificates    │
    └───────────────────┘
```

* * *

## Tech Stack

<table>
  <tr>
    <td width="50%" valign="top">
      <b>Backend Language & Framework</b><br><br>
      <img src="https://img.shields.io/badge/Java_17-007396?style=for-the-badge&logo=java&logoColor=white" />
      <img src="https://img.shields.io/badge/Spring_Boot_3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
      <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" />
      <img src="https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
      <img src="https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white" />
      <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
    </td>
    <td width="50%" valign="top">
      <b>Frontend</b><br><br>
      <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
      <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
      <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
      <img src="https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white" />
      <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>Database & Migration</b><br><br>
      <img src="https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
      <img src="https://img.shields.io/badge/Flyway-CC0200?style=for-the-badge&logo=flyway&logoColor=white" />
    </td>
    <td width="50%" valign="top">
      <b>Build & Utilities</b><br><br>
      <img src="https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" />
      <img src="https://img.shields.io/badge/Apache_PDFBox-D22128?style=for-the-badge&logo=apache&logoColor=white" />
      <img src="https://img.shields.io/badge/WebClient-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>Infrastructure & Deployment</b><br><br>
      <img src="https://img.shields.io/badge/AWS_Elastic_Beanstalk-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
      <img src="https://img.shields.io/badge/AWS_RDS-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white" />
      <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
    </td>
    <td width="50%" valign="top">
      <b>External API</b><br><br>
      <img src="https://img.shields.io/badge/VaultSage_API-6366F1?style=for-the-badge&logoColor=white" />
    </td>
  </tr>
</table>

* * *

## Getting Started

### Prerequisites

- Java 17+
- Node.js 20+
- Docker (for local PostgreSQL)
- VaultSage API Key (get one at [vaultsage.ai](https://vaultsage.ai))

### Run Backend Locally

```bash
# 1. Start PostgreSQL
docker run -d \
  --name foliosage-pg \
  -e POSTGRES_DB=foliosage \
  -e POSTGRES_USER=foliosage \
  -e POSTGRES_PASSWORD=foliosage \
  -p 5432:5432 \
  postgres:16

# 2. Set environment variables (see Environment Variables section below)

# 3. Run
cd foliosage-backend
./mvnw spring-boot:run
```

### Run Frontend Locally

```bash
cd foliosage-frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL in .env.local
npm run dev
```

* * *

## Environment Variables

### Backend (`application.yml` / Elastic Beanstalk environment properties)

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/foliosage
DB_USERNAME=foliosage
DB_PASSWORD=foliosage

# JWT
JWT_SECRET=your-minimum-256-bit-secret-key
JWT_EXPIRATION_MS=86400000

# VaultSage
VAULTSAGE_API_KEY=your-vaultsage-api-key
VAULTSAGE_BASE_URL=https://api.vaultsage.ai

# CORS
CORS_ORIGINS=http://localhost:3000
APP_BASE_URL=http://localhost:3000
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

* * *

## Project Structure

```
foliosage/
├── foliosage-backend/                  # Spring Boot backend
│   ├── src/main/java/com/foliosage/
│   │   ├── config/                     # Security, WebClient, Async config
│   │   ├── controller/                 # Auth, Portfolio, Public controllers
│   │   ├── service/
│   │   │   ├── VaultSageService.java   # VaultSage API client
│   │   │   ├── PortfolioService.java   # Portfolio CRUD
│   │   │   ├── OrganizeService.java    # Smart Organizer pipeline
│   │   │   ├── CertificateService.java # PDF certificate generation
│   │   │   └── ShareService.java       # Public link management
│   │   ├── entity/                     # JPA entities
│   │   ├── repository/                 # Spring Data repositories
│   │   ├── dto/                        # Request / response DTOs
│   │   └── security/                   # JWT filter
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/               # Flyway SQL migrations
│
├── foliosage-frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── dashboard/                  # Portfolio list
│   │   ├── portfolios/                 # Create + manage portfolios
│   │   └── p/[shareCode]/              # Public portfolio page
│   ├── components/
│   │   ├── FileGallery.tsx             # Gallery grid
│   │   ├── ChatPanel.tsx               # AI chat panel
│   │   ├── OrganizeStatus.tsx          # AI organize progress
│   │   └── CertificateBadge.tsx        # Certificate badge
│   └── lib/
│       ├── api.ts                      # Axios client
│       └── auth.ts                     # Token management
│
└── docs/
    └── superpowers/
        ├── specs/                      # Design documents
        └── plans/                      # Implementation plans
```

* * *

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new account |
| POST | `/api/auth/login` | Login and receive JWT |

### Portfolios

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolios` | Create a portfolio |
| GET | `/api/portfolios` | List my portfolios |
| GET | `/api/portfolios/{id}` | Get portfolio details |
| DELETE | `/api/portfolios/{id}` | Delete portfolio |
| POST | `/api/portfolios/{id}/files` | Upload files |
| POST | `/api/portfolios/{id}/organize` | Start AI organization |
| GET | `/api/portfolios/{id}/organize/status` | Poll organize status |
| POST | `/api/portfolios/{id}/publish` | Generate public link |
| GET | `/api/portfolios/{id}/visitors` | Get visitor analytics |
| GET | `/api/portfolios/{id}/certificates/{fileId}/download` | Download certificate PDF |

### Public Access (no login required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/{shareCode}` | Get portfolio data |
| POST | `/api/public/{shareCode}/chat` | Send AI chat message |
| GET | `/api/public/{shareCode}/chat/history` | Get chat history |

* * *

## Git Convention

### Branch Strategy

```
main          # Production branch
develop       # Development integration branch
feat/{name}   # Feature development
fix/{name}    # Bug fixes
chore/{name}  # Config, dependencies
```

### Commit Messages

```
feat:     Add new feature
fix:      Fix a bug
docs:     Update documentation
style:    Code formatting
refactor: Code refactoring
test:     Add or update tests
chore:    Build or config changes
```

**Examples:**
```bash
git commit -m "feat: add VaultSage smart organizer pipeline"
git commit -m "fix: handle chat/public timeout gracefully"
git commit -m "docs: update API reference in README"
```

* * *

## Competition

This project is an entry for the **NURIE.AI Visionary AI 2026 Cross-Platform Innovation Awards**.

- Powered by VaultSage Server-side API
- Submission deadline: May 25, 2026
- Hashtag: `#vaultsage`

* * *

## License

MIT License © 2026 FolioSage
