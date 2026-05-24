# FolioSage

> AI가 정리하고, 설명하고, 증명하는 포트폴리오 플랫폼

[![Java](https://img.shields.io/badge/Java-21-007396?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![VaultSage](https://img.shields.io/badge/VaultSage-API-6366F1?style=flat-square)](https://vaultsage.ai/)

FolioSage는 취업 준비생, 디자이너, 개발자, 크리에이터가 흩어진 작업 파일을 업로드하면 AI가 포트폴리오 구조로 정리하고, 실제 파일 근거를 바탕으로 소개 글과 질의응답을 제공하는 증거 기반 포트폴리오 서비스입니다.

공모전 제출작: **NURIE.AI Visionary AI 2026 Cross-Platform Innovation Awards**

## 핵심 아이디어

일반 포트폴리오는 결과물 이미지만 보여주기 쉽습니다. FolioSage는 결과물 뒤에 있는 기획서, 리서치, 코드, 시안, 발표 자료 같은 작업 증거를 함께 다루어 다음 질문에 답합니다.

- 이 사람이 실제로 어떤 역할을 했는가?
- 결과물의 근거 파일과 작업 과정이 남아 있는가?
- 면접관이나 심사자가 직접 파일을 뒤지지 않고도 내용을 검증할 수 있는가?
- 제출자가 자신의 작업을 설명하고 방어할 준비가 되어 있는가?

FolioSage는 VaultSage API를 evidence layer로 사용해 파일 저장, 스마트 정리, 공개 공유, 공개 채팅을 연결합니다.

## 주요 기능

- **AI 파일 정리**: 업로드한 파일을 VaultSage Smart Organizer로 프로젝트/근거 구조에 맞게 자동 분류합니다.
- **포트폴리오 스토리 생성**: 역할, 문제, 해결, 임팩트, 증거 중심의 포트폴리오 설명을 생성하고 편집할 수 있습니다.
- **공개 포트폴리오 링크**: 로그인 없이 볼 수 있는 `/p/{shareCode}` 페이지를 발급합니다.
- **근거 기반 AI 채팅**: 방문자가 포트폴리오에 대해 질문하면 공개된 파일을 기반으로 답변합니다.
- **AI Defense Review**: 제출자가 AI 면접 질문에 답하면 근거 인용과 함께 점수표를 생성합니다.
- **파일 인증서**: 업로드 파일마다 SHA-256 해시와 타임스탬프를 담은 PDF 인증서를 발급합니다.
- **방문/다운로드 통계**: 공개 포트폴리오 조회수와 파일 다운로드 수를 집계합니다.
- **공개 프로필**: 사용자별 공개 포트폴리오 목록을 `/u/{username}`에서 보여줍니다.

## 데모 플로우

1. 회원가입 또는 로그인
2. 포트폴리오 생성
3. 프로젝트 파일 업로드
4. AI 자동 정리 실행
5. 포트폴리오 스토리 생성 및 수정
6. AI Defense Review로 면접/심사 질문 답변
7. 공개 링크 발급
8. 방문자가 포트폴리오 파일을 확인하고 AI에게 질문
9. 제출자는 조회수, 다운로드 수, 인증서를 확인

## VaultSage 활용 지점

FolioSage는 VaultSage를 단순 파일 저장소가 아니라 포트폴리오 신뢰 계층으로 사용합니다.

| VaultSage 기능 | FolioSage 사용 방식 |
| --- | --- |
| Files API | 원본 작업 파일 업로드, 미리보기, 다운로드 |
| Smart Organizer API | 흩어진 파일을 프로젝트 근거 구조로 자동 정리 |
| Share API | 공개 포트폴리오 접근 범위 생성 |
| Public Chat API | 공개된 파일에 근거한 방문자 질의응답 |

## 시스템 구조

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

