# FolioSage

> AI가 정리하고, 설명하고, 증명하는 포트폴리오 플랫폼

[![Java](https://img.shields.io/badge/Java-21-007396?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![VaultSage](https://img.shields.io/badge/VaultSage-API-6366F1?style=flat-square)](https://vaultsage.ai/)

FolioSage는 취업 준비생, 디자이너, 개발자, 크리에이터가 흩어진 작업 파일을 업로드하면 AI가 포트폴리오 구조로 정리하고, 실제 파일 근거를 바탕으로 소개 글과 질의응답을 제공하는 증거 기반 포트폴리오 서비스입니다.

공모전 제출작: **NURIE.AI Visionary AI 2026 Cross-Platform Innovation Awards**

## Submission Overview

**FolioSage는 포트폴리오를 예쁘게 보여주는 데서 끝나지 않고, 실제 작업 파일을 근거로 역할과 과정, 완성도를 설명하고 검증할 수 있게 해주는 AI 포트폴리오 플랫폼입니다.**

FolioSage turns scattered project files into an evidence-backed portfolio. A creator can upload proposals, presentation decks, PDFs, images, code files, and process artifacts. The system then organizes the files, generates an interview-ready story, reviews the creator's answers with AI, and publishes a public portfolio where visitors can ask questions grounded in the uploaded files.

| Item | Description |
| --- | --- |
| Competition | NURIE.AI Visionary AI 2026 Cross-Platform Innovation Awards |
| Category | Web (Browser-based), with REST API and public share links |
| Target users | Job seekers, designers, developers, creators, portfolio reviewers |
| Core value | AI-generated portfolio content with real source-file evidence |
| External AI layer | VaultSage Files, Smart Organizer, Share, Public Chat APIs |

## Why It Matters

Most portfolio sites show polished outputs but do not prove how the work was made. Reviewers still need to ask:

- Did this person actually contribute to the project?
- Which files prove the planning, process, and final result?
- Can the creator explain trade-offs, impact, and missing evidence?
- Can a visitor ask questions without manually opening every file?

FolioSage answers these questions by connecting portfolio storytelling, AI review, public Q&A, file hashes, timestamps, and certificates into one workflow.

## Product Screenshots

> Screenshot placeholders are intentionally left as text so images can be added later without broken README links.

| Screen | Screenshot Slot | What Judges Should Notice |
| --- | --- | --- |
| Dashboard | `docs/screenshots/01-dashboard.png` | Portfolio count, published count, uploaded file count |
| File Upload | `docs/screenshots/02-upload.png` | Multiple evidence files can be uploaded, not only final outputs |
| AI Organizer | `docs/screenshots/03-ai-organizer.png` | VaultSage Smart Organizer classifies files into a proof structure |
| Portfolio Story | `docs/screenshots/04-story.png` | Summary, role, problem, solution, impact, evidence highlights |
| Readiness | `docs/screenshots/05-readiness.png` | Checklist for Story, Evidence, AI Review, Public Link |
| AI Review | `docs/screenshots/06-ai-review.png` | Interview questions, feedback, scorecard, missing proof, cited files |
| Public Page | `docs/screenshots/07-public-page.png` | Shareable portfolio page with story and evidence grid |
| Public AI Chat | `docs/screenshots/08-public-chat.png` | Visitor questions answered from uploaded file evidence |
| Stats / Certificate | `docs/screenshots/09-certificate-stats.png` | View/download statistics and file certificate |

After adding screenshots, replace the slots above or add image links like this:

```md
![Dashboard](docs/screenshots/01-dashboard.png)
![AI Story](docs/screenshots/04-story.png)
![Public AI Chat](docs/screenshots/08-public-chat.png)
```

## Judge Demo Path

If evaluation time is short, the following five scenes show the core innovation:

1. **파일 업로드**: 결과물뿐 아니라 기획서, 발표자료, 코드, 이미지 같은 과정 파일까지 증거로 관리합니다.
2. **AI 스토리 생성**: Summary, 역할, 문제, 해결, 임팩트를 업로드 파일 기준으로 자동 작성합니다.
3. **AI 포트폴리오 리뷰**: AI가 면접/심사 질문을 만들고, 답변에 대한 피드백과 점수표, 부족한 증거, 인용 파일을 보여줍니다.
4. **공개 링크 발급**: `/p/{shareCode}` 공개 페이지로 포트폴리오를 공유합니다.
5. **방문자 AI 채팅**: 방문자가 질문하면 실제 업로드 파일을 근거로 답변합니다.

## Full Demo Scenario

| 순서 | 화면 | 보여줄 내용 | 핵심 설명 |
| --- | --- | --- | --- |
| 1 | 로그인 / 대시보드 | 포트폴리오 수, 공개 중, 파일 수 | 흩어진 작업 파일을 증거 기반 포트폴리오로 정리하는 서비스 |
| 2 | 새 포트폴리오 생성 | 제목과 설명 입력 | 결과물만 올리는 것이 아니라 과정 파일까지 증거로 관리 |
| 3 | 파일 업로드 | 기획서, 발표자료, 이미지, PDF, 코드/압축 파일 업로드 | 파일마다 해시와 인증 정보를 기반으로 추적 |
| 4 | AI 파일 정리 | AI 자동 정리 실행 | VaultSage Smart Organizer로 파일을 프로젝트 근거 구조에 맞게 분류 |
| 5 | Portfolio Story 생성 | Summary, 역할, 문제, 해결, 임팩트 자동 생성 | Evidence Highlights와 Interview Questions도 함께 생성 |
| 6 | 스토리 수정 / 저장 | AI 초안 편집 후 저장 | AI 초안 + 사용자의 최종 통제 구조 |
| 7 | Readiness 체크 | Story, Evidence, AI Review, Public Link 준비 상태 | 제출 가능한 상태인지 점수와 체크리스트로 확인 |
| 8 | AI Portfolio Review | 질문 생성, 답변 입력, 피드백/점수표 확인 | 단순 챗봇이 아니라 실제 업로드 파일을 근거로 리뷰 |
| 9 | 공개 링크 발급 | 포트폴리오 공개 및 링크 복사 | 로그인 없이 확인 가능한 공개 포트폴리오 생성 |
| 10 | 방문자 화면 | 스토리, 파일 그리드, 미리보기/다운로드 | 심사자가 결과물과 근거 파일을 한 화면에서 확인 |
| 11 | 방문자 AI 채팅 | 역할, 주요 증거, 보완점 질문 | AI가 공개 파일을 기반으로 답변하고 근거 파일을 표시 |
| 12 | 공개 AI 리뷰 결과 | Overall score, 평가 항목, 인용 파일 | 리뷰 결과도 방문자에게 공개 가능 |
| 13 | 통계 / 인증서 | 조회수, 다운로드 수, 파일 인증서 | 공유 이후 반응과 파일 무결성 근거 확인 |

방문자 AI 채팅 예시 질문:

- 이 프로젝트에서 작성자의 역할은 무엇인가요?
- 가장 중요한 증거 파일 3개를 설명해 주세요.
- 심사자 관점에서 보완할 점은 무엇인가요?

## Core Features

| Feature | What It Does | Evidence / AI Value |
| --- | --- |
| Multi-file evidence upload | Upload PDFs, images, decks, code files, ZIPs, and process artifacts | Stores file metadata, SHA-256 hash, timestamp, and VaultSage file id |
| AI file organization | Runs VaultSage Smart Organizer for project evidence structure | Makes scattered files easier to inspect and explain |
| Portfolio Story generation | Generates summary, role, problem, solution, impact | Turns uploaded evidence into interview-ready copy |
| Evidence Highlights | Links generated claims to concrete uploaded files | Helps reviewers inspect the proof behind the story |
| Interview Questions | Creates likely defense questions from the portfolio context | Helps creators prepare for interviews and judging |
| AI Portfolio Review | Scores creator answers and returns feedback, missing proof, cited files | Reviews are grounded in actual portfolio files |
| Public portfolio page | Publishes `/p/{shareCode}` for visitors | Judges can inspect story, file grid, preview, download |
| Visitor AI chat | Lets visitors ask questions about the portfolio | AI answers from the public file context |
| Certificate / stats | Provides file certificates and view/download statistics | Supports trust, ownership, and post-share tracking |

## VaultSage 활용 지점

FolioSage는 VaultSage를 단순 파일 저장소가 아니라 포트폴리오 신뢰 계층으로 사용합니다.

| VaultSage 기능 | FolioSage 사용 방식 |
| --- | --- |
| Files API | 원본 작업 파일 업로드, 미리보기, 다운로드 |
| Smart Organizer API | 흩어진 파일을 프로젝트 근거 구조로 자동 정리 |
| Share API | 공개 포트폴리오 접근 범위 생성 |
| Public Chat API | 공개된 파일에 근거한 방문자 질의응답 |

## Architecture

```text
Creator / Visitor
       |
       v
Next.js 16 Frontend
  - dashboard
  - portfolio editor
  - public portfolio page
  - public profile page
       |
       v
Spring Boot 3.4 Backend
  - JWT / Google OAuth
  - portfolio API
  - publish API
  - defense review API
  - certificate generation
       |
       +--> PostgreSQL 16
       |      users, portfolios, files, stories, defense sessions
       |
       +--> VaultSage API
              files, smart organizers, shares, public chat
```

## Test Instructions for Judges

1. Clone the repository.
2. Prepare `.env` from `.env.docker.example`.
3. Set at least `JWT_SECRET`, `POSTGRES_PASSWORD`, and `VAULTSAGE_API_KEY`.
4. Run the full stack:

```bash
docker compose up --build
```

5. Open `http://localhost:3000`.
6. Sign up or log in.
7. Create a portfolio.
8. Upload sample project files such as a PDF, image, presentation deck, source code file, or ZIP.
9. Run AI file organization.
10. Generate the Portfolio Story.
11. Publish the portfolio and open `/p/{shareCode}`.
12. Ask the public AI guide a question.
13. Return to the admin screen, run AI Portfolio Review, answer the generated questions, and inspect the scorecard.

Required external dependency: a valid VaultSage API key.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js 16.2.4, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Base UI, Zustand, Axios, lucide-react |
| Backend | Java 21, Spring Boot 3.4.4, Spring Security, Spring Data JPA, WebFlux WebClient, Validation |
| Auth | JWT, Google OAuth2 |
| Database | PostgreSQL 16, Flyway |
| Document | Apache PDFBox |
| Infra | Docker, Docker Compose |
| External API | VaultSage API |

## 프로젝트 구조

```text
foliosage/
├── foliosage-backend/
│   ├── src/main/java/com/foliosage/
│   │   ├── config/          # Security, WebClient 설정
│   │   ├── controller/      # Auth, User, Portfolio, Public API
│   │   ├── dto/             # 요청/응답 DTO
│   │   ├── entity/          # JPA 엔티티
│   │   ├── repository/      # Spring Data Repository
│   │   ├── security/        # JWT, OAuth2 핸들러
│   │   └── service/         # 포트폴리오, VaultSage, 인증서, Defense 로직
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/    # Flyway 마이그레이션
├── foliosage-frontend/
│   ├── app/                 # Next.js App Router
│   ├── components/          # UI 및 포트폴리오 컴포넌트
│   └── lib/                 # API client, auth helper
├── docs/
│   ├── screenshots/         # README 심사용 화면 캡처 이미지
│   ├── submission/          # 공모전 제출 폼 초안
│   ├── vaultsage-openapi.json
│   └── superpowers/         # 설계 문서 및 구현 계획
├── docker-compose.yml
└── .env.docker.example
```

## 빠른 실행

### 1. Docker Compose로 전체 실행

```bash
cp .env.docker.example .env
```

`.env`에서 최소한 다음 값을 설정합니다.

```env
POSTGRES_PASSWORD=change-me
JWT_SECRET=change-this-to-a-long-random-256-bit-secret-before-deploying
VAULTSAGE_API_KEY=your-vaultsage-api-key
```

실행:

```bash
docker compose up --build
```

로컬 주소:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `127.0.0.1:5432`

### 2. 개발 모드로 실행

PostgreSQL:

```bash
docker run -d \
  --name foliosage-pg \
  -e POSTGRES_DB=foliosage \
  -e POSTGRES_USER=foliosage \
  -e POSTGRES_PASSWORD=foliosage \
  -p 5432:5432 \
  postgres:16
```

Backend:

```bash
cd foliosage-backend
./gradlew bootRun
```

Frontend:

```bash
cd foliosage-frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

## 환경 변수

### Backend

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/foliosage` |
| `DB_USERNAME` | DB 사용자 | `foliosage` |
| `DB_PASSWORD` | DB 비밀번호 | `foliosage` |
| `JWT_SECRET` | JWT 서명 키 | 개발용 기본값 |
| `JWT_EXPIRATION_MS` | JWT 만료 시간 | `86400000` |
| `VAULTSAGE_API_KEY` | VaultSage API 키 | `test-key` |
| `VAULTSAGE_BASE_URL` | VaultSage API Base URL | `https://api.vaultsage.ai` |
| `CORS_ORIGINS` | 허용할 프론트엔드 Origin | `http://localhost:3000` |
| `APP_BASE_URL` | 공개 링크 생성 기준 URL | `http://localhost:3000` |
| `APP_FRONTEND_URL` | OAuth 성공 후 이동할 프론트엔드 URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `dummy` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `dummy` |

### Frontend

| 변수 | 설명 | 예시 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 백엔드 API 주소 | `http://localhost:8080` |

## 주요 API

### Auth / User

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 및 JWT 발급 |
| `GET` | `/api/users/me` | 내 프로필 조회 |
| `PATCH` | `/api/users/me/profile` | 공개 프로필 수정 |

### Portfolio

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/api/portfolios` | 포트폴리오 생성 |
| `GET` | `/api/portfolios` | 내 포트폴리오 목록 |
| `GET` | `/api/portfolios/{id}` | 포트폴리오 상세 |
| `DELETE` | `/api/portfolios/{id}` | 포트폴리오 삭제 |
| `POST` | `/api/portfolios/{id}/files` | 파일 업로드 |
| `PATCH` | `/api/portfolios/{id}/files/{fileId}` | 파일 설명 수정 |
| `DELETE` | `/api/portfolios/{id}/files/{fileId}` | 파일 삭제 |
| `POST` | `/api/portfolios/{id}/organize` | AI 정리 시작 |
| `GET` | `/api/portfolios/{id}/organize/status` | AI 정리 상태 조회 |
| `GET` | `/api/portfolios/{id}/organize/tree` | 정리된 파일 트리 조회 |
| `GET` | `/api/portfolios/{id}/story` | 포트폴리오 스토리 조회 |
| `POST` | `/api/portfolios/{id}/story/generate` | 포트폴리오 스토리 생성 |
| `PATCH` | `/api/portfolios/{id}/story` | 포트폴리오 스토리 수정 |
| `GET` | `/api/portfolios/{id}/readiness` | 공개 준비 상태 조회 |
| `POST` | `/api/portfolios/{id}/publish` | 공개 링크 발급 |
| `POST` | `/api/portfolios/{id}/unpublish` | 공개 중지 |
| `GET` | `/api/portfolios/{id}/stats` | 조회/다운로드 통계 |
| `GET` | `/api/portfolios/{id}/visitors` | VaultSage 방문 로그 |
| `GET` | `/api/portfolios/{id}/certificates/{fileId}/download` | 파일 인증서 PDF 다운로드 |

### Defense Review

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/api/portfolios/{id}/defense/sessions` | AI Defense 세션 시작 |
| `GET` | `/api/portfolios/{id}/defense/sessions/latest` | 최신 Defense 결과 조회 |
| `POST` | `/api/portfolios/{id}/defense/sessions/{sessionId}/answers` | Defense 질문 답변 |

### Public

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/public/{shareCode}` | 공개 포트폴리오 조회 |
| `POST` | `/api/public/{shareCode}/chat` | 공개 포트폴리오 AI 채팅 |
| `GET` | `/api/public/{shareCode}/chat/history` | 공개 채팅 기록 조회 |
| `GET` | `/api/public/{shareCode}/defense` | 공개 Defense 요약 조회 |
| `GET` | `/api/public/{shareCode}/preview/{vaultsageFileId}` | 공개 파일 미리보기 |
| `GET` | `/api/public/{shareCode}/files/{vaultsageFileId}/raw` | 공개 파일 원본 보기/다운로드 |
| `GET` | `/api/public/{shareCode}/certificates/{fileId}/download` | 공개 파일 인증서 다운로드 |
| `GET` | `/api/public/users/{username}` | 공개 사용자 프로필 조회 |

## 테스트

Backend:

```bash
cd foliosage-backend
./gradlew test
```

Frontend:

```bash
cd foliosage-frontend
npm run build
```

## 공모전 제출 포인트

- **Cross-platform**: 웹 대시보드, 공개 포트폴리오, 공개 프로필, REST API로 구성된 풀스택 서비스
- **AI utility**: 파일 정리, 스토리 생성, 방문자 Q&A, 면접 방어 리뷰가 하나의 워크플로우로 연결됨
- **Evidence-backed output**: AI 답변과 스토리가 업로드된 실제 파일을 기준으로 동작함
- **Trust layer**: 파일별 해시와 타임스탬프 기반 인증서로 제출물의 소유/무결성 근거를 제공함
- **VaultSage integration**: Files, Smart Organizer, Share, Public Chat API를 제품 핵심 플로우에 통합함

## 배포 메모

프로덕션 또는 데모 서버에서는 다음 값을 실제 도메인으로 맞춥니다.

```env
CORS_ORIGINS=https://your-domain.com
APP_BASE_URL=https://your-domain.com
APP_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

권장 구성:

- Frontend: Vercel 또는 Docker
- Backend: AWS Elastic Beanstalk, ECS, EC2 Docker 중 선택
- Database: AWS RDS PostgreSQL
