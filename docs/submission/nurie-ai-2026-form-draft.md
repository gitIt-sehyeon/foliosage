# NURIE.AI 2026 Submission Form Draft

이 문서는 **Visionary AI: NURIE.AI 2026 Cross-Platform Innovation Awards** 제출 폼에 붙여 넣기 위한 초안입니다. 실제 배포 URL, GitHub URL, 데모 영상 URL은 제출 전에 교체하세요.

## Your register email

```text
tpgusdla5789@gmail.com
```

## Your register name

```text
YOUR_NAME_HERE
```

## Describe your submission

```text
FolioSage is an evidence-based AI portfolio platform for job seekers, designers, developers, and creators.

Users upload project files such as proposals, presentation slides, images, PDFs, source code, and process artifacts. FolioSage organizes those files with VaultSage Smart Organizer, generates an interview-ready portfolio story, and creates AI review questions based on the actual uploaded evidence.

Unlike a normal portfolio site that only displays final outputs, FolioSage connects each claim to source files, SHA-256 file hashes, timestamps, evidence highlights, and AI feedback. Visitors can open a public portfolio link, preview/download files, and ask an AI guide questions that are answered from the shared portfolio files.

The core goal is to help creators explain and prove their role, process, and impact with real evidence.
```

한국어 버전:

```text
FolioSage는 취업 준비생, 디자이너, 개발자, 크리에이터를 위한 증거 기반 AI 포트폴리오 플랫폼입니다.

사용자는 기획서, 발표자료, 이미지, PDF, 코드, 작업 과정 산출물 같은 프로젝트 파일을 업로드합니다. FolioSage는 VaultSage Smart Organizer로 파일을 정리하고, 업로드된 실제 파일을 근거로 면접용 포트폴리오 스토리와 AI 리뷰 질문을 생성합니다.

일반 포트폴리오 사이트가 최종 결과물만 보여주는 것과 달리, FolioSage는 각 설명을 원본 파일, SHA-256 해시, 타임스탬프, 근거 하이라이트, AI 피드백과 연결합니다. 방문자는 공개 포트폴리오 링크에서 파일을 미리보고 다운로드할 수 있으며, AI 가이드에게 질문하면 공개된 파일 근거를 바탕으로 답변을 받을 수 있습니다.

핵심 목표는 창작자가 자신의 역할, 과정, 임팩트를 실제 증거로 설명하고 검증할 수 있게 하는 것입니다.
```

## Which platform category does your innovation primarily target?

```text
Web (Browser-based)
```

보조 설명이 필요하면:

```text
The main product is a browser-based web application with a Next.js frontend and Spring Boot backend. It also exposes REST APIs and public portfolio links, so it can be extended to cross-platform clients later.
```

## Links

```text
GitHub: https://github.com/YOUR_GITHUB_USERNAME/foliosage
Live demo: https://YOUR_DEMO_DOMAIN
Public sample portfolio: https://YOUR_DEMO_DOMAIN/p/YOUR_SHARE_CODE
Demo video: https://YOUR_VIDEO_LINK
```

라이브 배포나 영상이 아직 없다면 최소 제출:

```text
GitHub: https://github.com/YOUR_GITHUB_USERNAME/foliosage
Detailed README and demo flow are included in the repository.
```

## Upload supporting files or links

권장 업로드:

```text
Demo video under 10 MB, showing:
1. file upload
2. AI story generation
3. AI portfolio review
4. public link
5. visitor AI chat
```

대체 자료:

```text
GitHub README includes the product explanation, architecture, demo scenario, setup instructions, and screenshot guide.
```

## Describe how we can test/check your submission

```text
1. Open the GitHub repository and follow the Quick Start section in README.md.
2. Set the required environment variables, especially VAULTSAGE_API_KEY and JWT_SECRET.
3. Run the full stack with Docker Compose:
   docker compose up --build
4. Open http://localhost:3000.
5. Sign up or log in.
6. Create a new portfolio with a title and description.
7. Upload sample project files such as a PDF, presentation, image, source code, or ZIP file.
8. Run AI file organization.
9. Click Story Generate to create Summary, Role, Problem, Solution, Impact, Evidence Highlights, and Interview Questions.
10. Publish the portfolio and open the generated /p/{shareCode} public link.
11. Ask the public AI guide questions such as:
    - What was the creator's role in this project?
    - What are the three most important evidence files?
    - What should be improved from a judge's perspective?
12. Return to the admin page and run AI Portfolio Review. Answer the generated questions and check the feedback, scorecard, missing proof, and cited evidence files.
13. Check view/download statistics and download a file certificate.
```

한국어 버전:

```text
1. GitHub 저장소의 README.md에서 빠른 실행 방법을 확인합니다.
2. VAULTSAGE_API_KEY, JWT_SECRET 등 필수 환경 변수를 설정합니다.
3. Docker Compose로 전체 서비스를 실행합니다:
   docker compose up --build
4. http://localhost:3000 에 접속합니다.
5. 회원가입 또는 로그인을 합니다.
6. 제목과 설명을 입력해 새 포트폴리오를 생성합니다.
7. PDF, 발표자료, 이미지, 코드, ZIP 파일 등 샘플 프로젝트 파일을 업로드합니다.
8. AI 파일 정리를 실행합니다.
9. 스토리 생성을 클릭해 Summary, 역할, 문제, 해결, 임팩트, 핵심 근거, 면접 질문이 생성되는 것을 확인합니다.
10. 포트폴리오를 공개하고 생성된 /p/{shareCode} 링크를 엽니다.
11. 방문자 AI 가이드에 다음과 같은 질문을 합니다:
    - 이 프로젝트에서 작성자의 역할은 무엇인가요?
    - 가장 중요한 증거 파일 3개는 무엇인가요?
    - 심사자 관점에서 보완할 점은 무엇인가요?
12. 관리자 화면으로 돌아와 AI 포트폴리오 리뷰를 실행합니다. 생성된 질문에 답변하고 피드백, 점수표, 부족한 증거, 인용 파일을 확인합니다.
13. 조회수/다운로드 통계와 파일 인증서 다운로드 기능을 확인합니다.
```

## Anything need help?

```text
No special help is required. If possible, please review the README, demo flow, and public portfolio workflow together because the product is designed around evidence-backed AI portfolio review rather than a single static page.
```

