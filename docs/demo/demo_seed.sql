-- FolioSage production demo seed
--
-- Idempotent demo account:
--   email: jaydenjeongdev@gmail.com
--   password: FolioSage2026!
--   public portfolio: /p/FS-DEMO-2026
--
-- This inserts metadata-only demo files. Preview/download still depends on
-- matching VaultSage file ids existing in the configured VaultSage account.

BEGIN;

INSERT INTO users (
    id, email, password_hash, name, bio, username, location, linkedin_url, github_url, vaultsage_token, created_at
) VALUES (
    '10000000-0000-4000-8000-000000000001',
    'jaydenjeongdev@gmail.com',
    '$2b$10$HjT0bpdvHzgKBATsXH6Oke5RYoiiTWJHRShydE6rah/6MEDRdsO4q',
    '정세현',
    '분산 시스템과 백엔드 플랫폼을 깊게 파고드는 개발자입니다. 시스템 설계, 장애 격리, 성능 튜닝, 증거 기반 의사결정을 포트폴리오에서 함께 보여주는 방식을 중요하게 봅니다.',
    'jaydenjeong',
    'Seoul, Korea',
    'https://www.linkedin.com/in/jaydenjeongdev',
    'https://github.com/jaydenjeongdev',
    NULL,
    NOW() - INTERVAL '38 days'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    bio = EXCLUDED.bio,
    username = EXCLUDED.username,
    location = EXCLUDED.location,
    linkedin_url = EXCLUDED.linkedin_url,
    github_url = EXCLUDED.github_url;

INSERT INTO portfolios (
    id, user_id, title, description, organizer_id, directory_id, share_code, vaultsage_share_id,
    is_published, created_at, organize_status, organize_completed_at, view_count, download_count
) VALUES (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Seoul Micro-Brand Commerce Dashboard',
    '소규모 라이프스타일 브랜드가 광고비, 재고 위험, 상품별 전환율을 한 화면에서 판단하도록 만든 운영 대시보드 프로젝트입니다. 기획 노트, 리서치, 디자인 시안, API 계약, 코드 번들, 런칭 회고를 근거 파일로 함께 공개합니다.',
    'org_demo_seoul_microbrand_2026',
    'dir_demo_seoul_microbrand_2026',
    'FS-DEMO-2026',
    'share_demo_seoul_microbrand_2026',
    TRUE,
    NOW() - INTERVAL '31 days',
    'done',
    NOW() - INTERVAL '30 days 22 hours',
    1486,
    237
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    organizer_id = EXCLUDED.organizer_id,
    directory_id = EXCLUDED.directory_id,
    share_code = EXCLUDED.share_code,
    vaultsage_share_id = EXCLUDED.vaultsage_share_id,
    is_published = EXCLUDED.is_published,
    organize_status = EXCLUDED.organize_status,
    organize_completed_at = EXCLUDED.organize_completed_at,
    view_count = EXCLUDED.view_count,
    download_count = EXCLUDED.download_count;

INSERT INTO portfolio_files (
    id, portfolio_id, vaultsage_file_id, name, file_hash, file_size, mime_type,
    certified_at, created_at, description, category, category_confidence, category_reasoning, category_locked
) VALUES
(
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_project_brief_pdf',
    '01_project_brief.pdf',
    'a3f4db8d3e3d2a8d33b7f65cc4e01d0bb1e857bb4ec44b6fd3bd8a65dc1c78d1',
    1843200,
    'application/pdf',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days',
    '문제 정의, 타깃 사용자, 성공 지표, 4주 구현 범위를 정리한 프로젝트 브리프입니다.',
    'document',
    96,
    '브리프와 문제 정의가 포함된 PDF 문서이므로 문서 근거로 분류했습니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_research_pdf',
    '02_market_research_notes.pdf',
    'b12b7a04a97c14f7ab6a7cfb2e09d6d9cbb569d92c3b30ad9743a7011ca38cb2',
    2418688,
    'application/pdf',
    NOW() - INTERVAL '29 days 22 hours',
    NOW() - INTERVAL '29 days 22 hours',
    '브랜드 운영자 7명 인터뷰, 경쟁 도구 비교, 핵심 불편 사항을 요약한 리서치 노트입니다.',
    'document',
    94,
    '인터뷰와 시장 조사 내용이 포함된 리서치 문서입니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_metric_model_xlsx',
    '03_metric_model_and_kpi_map.xlsx',
    'e339ce9e6fa2f9a2c6f561e7b1f65836f4fc73a21d67a8e295d3cb69a3861a0f',
    912384,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days',
    '매출, ROAS, 재고 소진일, 상품별 전환율 산식을 연결한 KPI 모델입니다.',
    'document',
    91,
    '수치 모델과 KPI 정의가 담긴 스프레드시트입니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_wireframe_png',
    '04_wireframe_iteration.png',
    '7ab4fbf15f3a0a9f15c93e4d01df33c351e0d914a94d02bc5e9de050e17fd8ec',
    1430528,
    'image/png',
    NOW() - INTERVAL '27 days',
    NOW() - INTERVAL '27 days',
    '초기 와이어프레임에서 캠페인, 재고, 전환율 패널을 재배치한 변화 기록입니다.',
    'visual',
    95,
    '와이어프레임 이미지로 화면 구조와 반복 과정을 보여주는 비주얼 근거입니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_dashboard_visual_png',
    '05_dashboard_design_export.png',
    '5cd9d5de0792d2c51f2153c5824d4618af4f761c70adbc87bbfbdbb855ebac2c',
    2637824,
    'image/png',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days',
    '최종 대시보드 디자인 익스포트입니다. 카드 우선순위와 위험 알림 상태를 확인할 수 있습니다.',
    'visual',
    97,
    '최종 화면을 직접 보여주는 핵심 비주얼 산출물입니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_openapi_yaml',
    '06_api_contract_openapi.yaml',
    '0dd2703d83c02b27e9f8d83d583c3c64c760e4d11f7b7fd2db072aa844d4417e',
    124928,
    'application/yaml',
    NOW() - INTERVAL '24 days',
    NOW() - INTERVAL '24 days',
    '상품 성과, 캠페인 비용, 재고 위험 API의 응답 스키마를 정의한 OpenAPI 계약입니다.',
    'system',
    96,
    'API 계약 파일로 시스템 구조와 데이터 연결 방식을 증명합니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000007',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_component_tsx',
    '07_dashboard_components.tsx',
    '2a8a4f92f623bf532f71e56b82c2b3f4cf915ea56a95d2dfaa8b868a9a751ced',
    217088,
    'text/typescript',
    NOW() - INTERVAL '22 days',
    NOW() - INTERVAL '22 days',
    '필터 가능한 KPI 카드, 재고 위험 테이블, 캠페인 비교 컴포넌트를 구현한 코드 파일입니다.',
    'system',
    94,
    '프론트엔드 컴포넌트 구현을 보여주는 TypeScript 코드입니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000008',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_ab_test_xlsx',
    '08_ab_test_results.xlsx',
    '6726505a881f0af50fae6d9fdb8e96f4a70b7b798b782c2d6b85a94b3920375c',
    683008,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days',
    '운영자 12명 사용성 테스트와 CTA 배치 변경 전후 결과를 정리한 실험 결과입니다.',
    'document',
    89,
    '성과와 사용성 개선을 수치로 뒷받침하는 결과 문서입니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000009',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_handoff_zip',
    '09_frontend_handoff_bundle.zip',
    'c97d60df2f16a0715f0f9e3a49e6168af92df290b4563361c66911ed458e293f',
    7213056,
    'application/zip',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days',
    '컴포넌트, 스타일 토큰, 샘플 데이터를 묶은 최종 프론트엔드 핸드오프 번들입니다.',
    'deliverable',
    98,
    'ZIP 형식의 최종 전달 번들이므로 산출물로 분류했습니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000010',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_presentation_pdf',
    '10_final_presentation_deck.pdf',
    'f2b6e4c1d762c1c39868274a2b4eac2d8e6dfd5e0deffad12ed3420a45b3981c',
    3842048,
    'application/pdf',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days',
    '문제, 접근, 구현 결과, 지표 개선, 다음 과제를 12장으로 정리한 발표 자료입니다.',
    'deliverable',
    92,
    '최종 발표와 제출에 쓰인 산출물입니다.',
    FALSE
),
(
    '30000000-0000-4000-8000-000000000011',
    '20000000-0000-4000-8000-000000000001',
    'vs_demo_retro_pdf',
    '11_launch_retrospective.pdf',
    '9d049b7da3d2ad88fb1a94d77841c52f308e9f4b820fa08a55fd347c1fc0a7b7',
    1187840,
    'application/pdf',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    '런칭 이후 운영자 피드백, 남은 리스크, 다음 실험 계획을 정리한 회고 문서입니다.',
    'deliverable',
    87,
    '출시 후 학습과 개선 계획을 담은 최종 회고 산출물입니다.',
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    vaultsage_file_id = EXCLUDED.vaultsage_file_id,
    name = EXCLUDED.name,
    file_hash = EXCLUDED.file_hash,
    file_size = EXCLUDED.file_size,
    mime_type = EXCLUDED.mime_type,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    category_confidence = EXCLUDED.category_confidence,
    category_reasoning = EXCLUDED.category_reasoning,
    category_locked = EXCLUDED.category_locked;

INSERT INTO certificates (id, file_id, pdf_path, issued_at)
SELECT
    ('40000000-0000-4000-8000-' || lpad(row_number() over (ORDER BY id)::text, 12, '0'))::uuid,
    id,
    '/certificates/demo/' || id || '.pdf',
    certified_at
FROM portfolio_files
WHERE portfolio_id = '20000000-0000-4000-8000-000000000001'
ON CONFLICT (file_id) DO UPDATE SET
    pdf_path = EXCLUDED.pdf_path,
    issued_at = EXCLUDED.issued_at;

INSERT INTO portfolio_stories (
    id, portfolio_id, summary, role, problem, solution, impact,
    evidence_highlights_json, missing_proof_json, interview_questions_json,
    status, error_message, generated_at, updated_at
) VALUES (
    '50000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '소규모 라이프스타일 브랜드가 매일 흩어진 광고비, 재고, 상품 전환 데이터를 따로 확인하던 문제를 하나의 운영 대시보드로 정리했습니다. 이 포트폴리오는 문제 정의, 사용자 리서치, KPI 모델, 화면 반복, API 계약, 구현 코드, 런칭 결과까지 연결해 결과물뿐 아니라 만들어진 과정을 증거로 보여줍니다.',
    '저는 PM 겸 프론트엔드 리드로 참여해 운영자 인터뷰, 지표 모델링, 와이어프레임 반복, React 컴포넌트 구현, 최종 핸드오프 정리를 맡았습니다. 특히 상품별 전환율과 재고 소진 위험을 같은 의사결정 화면에 배치하는 구조를 제안하고 구현했습니다.',
    '초기 사용자는 매출, 광고비, 재고 데이터를 각각 다른 도구에서 확인했고, 캠페인 조정이나 재입고 판단을 위해 매번 수동 리포트를 만들었습니다. 그 결과 의사결정이 늦어지고, 잘 팔리는 상품도 재고 위험을 늦게 발견하는 문제가 있었습니다.',
    '인터뷰와 시장 조사에서 반복되는 판단 질문을 뽑고, KPI 산식을 먼저 정의한 뒤 와이어프레임을 세 차례 수정했습니다. 이후 OpenAPI 계약으로 데이터 구조를 고정하고, 대시보드 컴포넌트를 KPI 카드, 캠페인 비교, 재고 위험 테이블로 분리해 구현했습니다.',
    '테스트 결과 운영 리포트 작성 시간이 약 70% 줄었고, 캠페인 조정 판단 주기가 3일에서 1일로 짧아졌습니다. 발표 자료와 회고 문서에는 남은 한계와 다음 실험까지 기록해 심사자가 결과와 근거를 함께 확인할 수 있습니다.',
    '[
      {"fileId":"30000000-0000-4000-8000-000000000001","vaultsageFileId":"vs_demo_project_brief_pdf","fileName":"01_project_brief.pdf","reason":"문제 정의, 타깃 사용자, 성공 지표가 명시되어 포트폴리오 전체 맥락을 뒷받침합니다."},
      {"fileId":"30000000-0000-4000-8000-000000000002","vaultsageFileId":"vs_demo_research_pdf","fileName":"02_market_research_notes.pdf","reason":"운영자 인터뷰와 경쟁 도구 비교가 실제 사용자 문제를 증명합니다."},
      {"fileId":"30000000-0000-4000-8000-000000000005","vaultsageFileId":"vs_demo_dashboard_visual_png","fileName":"05_dashboard_design_export.png","reason":"최종 화면 구조와 정보 우선순위를 한눈에 확인할 수 있는 핵심 비주얼입니다."},
      {"fileId":"30000000-0000-4000-8000-000000000006","vaultsageFileId":"vs_demo_openapi_yaml","fileName":"06_api_contract_openapi.yaml","reason":"대시보드가 실제 데이터 구조를 기준으로 설계되었음을 보여주는 시스템 근거입니다."},
      {"fileId":"30000000-0000-4000-8000-000000000008","vaultsageFileId":"vs_demo_ab_test_xlsx","fileName":"08_ab_test_results.xlsx","reason":"사용성 테스트와 CTA 변경 결과가 임팩트 주장을 수치로 보강합니다."},
      {"fileId":"30000000-0000-4000-8000-000000000011","vaultsageFileId":"vs_demo_retro_pdf","fileName":"11_launch_retrospective.pdf","reason":"런칭 이후 피드백과 남은 개선 과제를 기록해 학습 과정을 보여줍니다."}
    ]',
    '["실제 운영 데이터와 연결된 서버 로그 또는 배포 링크가 추가되면 기술 검증력이 더 높아집니다.","비즈니스 임팩트를 장기 지표로 추적한 2주 이상 데이터가 있으면 설득력이 강해집니다.","팀 프로젝트라면 본인과 다른 참여자의 기여 범위를 더 명확히 분리한 문서가 있으면 좋습니다."]',
    '["이 프로젝트에서 본인이 직접 설계한 KPI는 무엇이고, 왜 그 지표가 운영자에게 중요했나요?","와이어프레임 반복 과정에서 가장 크게 바뀐 정보 구조는 무엇인가요?","OpenAPI 계약을 먼저 정의한 것이 구현 과정에서 어떤 리스크를 줄였나요?","A/B 테스트 결과가 예상과 달랐던 부분은 무엇이고 어떻게 해석했나요?","심사자가 본인 기여도를 의심한다면 어떤 파일 3개로 설명하겠습니까?"]',
    'ready',
    NULL,
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '9 days'
)
ON CONFLICT (portfolio_id) DO UPDATE SET
    summary = EXCLUDED.summary,
    role = EXCLUDED.role,
    problem = EXCLUDED.problem,
    solution = EXCLUDED.solution,
    impact = EXCLUDED.impact,
    evidence_highlights_json = EXCLUDED.evidence_highlights_json,
    missing_proof_json = EXCLUDED.missing_proof_json,
    interview_questions_json = EXCLUDED.interview_questions_json,
    status = EXCLUDED.status,
    error_message = EXCLUDED.error_message,
    generated_at = EXCLUDED.generated_at,
    updated_at = EXCLUDED.updated_at;

INSERT INTO portfolio_defense_sessions (
    id, portfolio_id, status, vaultsage_conversation_id, vaultsage_session_id,
    questions_json, scorecard_json, created_at, completed_at
) VALUES (
    '60000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'completed',
    'conv_demo_seoul_microbrand_2026',
    'session_demo_seoul_microbrand_2026',
    '["01_project_brief.pdf와 02_market_research_notes.pdf를 근거로, 이 프로젝트가 실제 사용자 문제에서 출발했다는 점을 설명해 주세요.","05_dashboard_design_export.png와 07_dashboard_components.tsx를 연결해 화면 설계가 구현으로 어떻게 이어졌는지 설명해 주세요.","03_metric_model_and_kpi_map.xlsx와 08_ab_test_results.xlsx를 기준으로 측정 가능한 임팩트를 방어해 주세요.","06_api_contract_openapi.yaml은 어떤 기술적 의사결정을 증명하며, 프론트엔드 구현 리스크를 어떻게 줄였나요?","11_launch_retrospective.pdf를 보면 아직 부족한 증거는 무엇이고, 다음 버전에서 무엇을 보강하겠습니까?"]',
    '{"overallScore":88,"categories":[{"name":"독창성","score":86,"rationale":"정적 포트폴리오가 아니라 근거 파일을 심사 질문과 연결한 구성이 차별적입니다."},{"name":"기술 깊이","score":84,"rationale":"API 계약과 컴포넌트 구현 파일이 있어 기술적 실행 흐름이 확인됩니다."},{"name":"근거 강도","score":91,"rationale":"기획, 리서치, 화면, 코드, 실험, 회고가 단계별로 연결되어 있습니다."},{"name":"스토리 명확성","score":92,"rationale":"문제, 역할, 해결, 임팩트가 같은 프로젝트 맥락으로 일관되게 이어집니다."},{"name":"부족한 증거","score":78,"rationale":"장기 운영 지표와 팀 기여 구분 문서가 추가되면 더 강해집니다."}],"missingProof":["실제 배포 URL 또는 운영 로그","2주 이상 장기 성과 추적 데이터","팀 내 역할 분담 확인 자료"],"summary":"전반적으로 제출 가능한 수준입니다. 가장 강한 장점은 문제 정의에서 구현, 실험, 회고까지 이어지는 증거 흐름입니다. 보완점은 장기 지표와 본인 기여 범위를 더 직접적으로 검증할 자료입니다."}',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    vaultsage_conversation_id = EXCLUDED.vaultsage_conversation_id,
    vaultsage_session_id = EXCLUDED.vaultsage_session_id,
    questions_json = EXCLUDED.questions_json,
    scorecard_json = EXCLUDED.scorecard_json,
    completed_at = EXCLUDED.completed_at;

INSERT INTO portfolio_defense_turns (
    id, session_id, question_index, question, answer, feedback, evidence_json, created_at, answered_at
) VALUES
(
    '70000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    0,
    '01_project_brief.pdf와 02_market_research_notes.pdf를 근거로, 이 프로젝트가 실제 사용자 문제에서 출발했다는 점을 설명해 주세요.',
    '프로젝트 브리프에서 타깃을 소규모 브랜드 운영자로 좁혔고, 리서치 노트에서 운영자들이 광고비, 재고, 전환율을 각각 다른 도구에서 확인한다는 반복 불편을 정리했습니다. 그래서 단순 매출 차트가 아니라 오늘 바로 조정해야 하는 상품과 캠페인을 한 화면에서 보여주는 방향으로 설계했습니다.',
    '{"feedback":"답변이 문제 정의와 리서치 파일을 정확히 연결합니다. 특히 사용자의 반복 작업을 화면 구조의 근거로 설명한 점이 강합니다.","evidenceFiles":["01_project_brief.pdf","02_market_research_notes.pdf"],"missingProof":"인터뷰 원문 일부나 인용 문장을 추가하면 현장성이 더 강해집니다."}',
    '[{"fileId":"30000000-0000-4000-8000-000000000001","vaultsageFileId":"vs_demo_project_brief_pdf","name":"01_project_brief.pdf","fileHash":"a3f4db8d3e3d2a8d33b7f65cc4e01d0bb1e857bb4ec44b6fd3bd8a65dc1c78d1","certifiedAt":"2026-04-25T09:00:00Z","reason":"문제 정의와 성공 지표를 확인하는 핵심 근거입니다."},{"fileId":"30000000-0000-4000-8000-000000000002","vaultsageFileId":"vs_demo_research_pdf","name":"02_market_research_notes.pdf","fileHash":"b12b7a04a97c14f7ab6a7cfb2e09d6d9cbb569d92c3b30ad9743a7011ca38cb2","certifiedAt":"2026-04-25T11:00:00Z","reason":"사용자 인터뷰와 경쟁 도구 비교를 포함합니다."}]',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
),
(
    '70000000-0000-4000-8000-000000000002',
    '60000000-0000-4000-8000-000000000001',
    1,
    '05_dashboard_design_export.png와 07_dashboard_components.tsx를 연결해 화면 설계가 구현으로 어떻게 이어졌는지 설명해 주세요.',
    '최종 디자인에서는 KPI 카드, 캠페인 비교, 재고 위험 테이블을 우선순위에 따라 배치했습니다. 구현 파일에서는 이 세 영역을 독립 컴포넌트로 나누고, 필터 상태를 공유하게 만들어 운영자가 상품군이나 기간을 바꿔도 같은 판단 흐름을 유지하도록 했습니다.',
    '{"feedback":"디자인 산출물과 코드 구조를 함께 설명해 역할의 실체가 잘 드러납니다. 컴포넌트 분리 이유까지 말한 점이 좋습니다.","evidenceFiles":["05_dashboard_design_export.png","07_dashboard_components.tsx"],"missingProof":"실제 컴포넌트 동작 화면이나 테스트 캡처가 추가되면 구현 검증이 더 쉬워집니다."}',
    '[{"fileId":"30000000-0000-4000-8000-000000000005","vaultsageFileId":"vs_demo_dashboard_visual_png","name":"05_dashboard_design_export.png","fileHash":"5cd9d5de0792d2c51f2153c5824d4618af4f761c70adbc87bbfbdbb855ebac2c","certifiedAt":"2026-04-30T09:00:00Z","reason":"최종 화면 구조와 정보 우선순위를 보여줍니다."},{"fileId":"30000000-0000-4000-8000-000000000007","vaultsageFileId":"vs_demo_component_tsx","name":"07_dashboard_components.tsx","fileHash":"2a8a4f92f623bf532f71e56b82c2b3f4cf915ea56a95d2dfaa8b868a9a751ced","certifiedAt":"2026-05-03T09:00:00Z","reason":"화면 설계가 실제 컴포넌트 구현으로 이어진 근거입니다."}]',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
),
(
    '70000000-0000-4000-8000-000000000003',
    '60000000-0000-4000-8000-000000000001',
    2,
    '03_metric_model_and_kpi_map.xlsx와 08_ab_test_results.xlsx를 기준으로 측정 가능한 임팩트를 방어해 주세요.',
    'KPI 맵에서 매출만 보지 않고 ROAS, 전환율, 재고 소진일을 함께 보도록 모델링했습니다. A/B 테스트 결과에서는 위험 알림과 캠페인 CTA 위치를 조정한 뒤 운영자가 리포트를 만드는 시간이 줄고 다음 행동을 더 빨리 선택했다는 결과가 나왔습니다.',
    '{"feedback":"지표 모델과 실험 결과를 연결해 임팩트 설명이 구체적입니다. 수치의 출처를 명시하면 더 설득력이 있습니다.","evidenceFiles":["03_metric_model_and_kpi_map.xlsx","08_ab_test_results.xlsx"],"missingProof":"테스트 표본 수, 측정 기간, 원본 이벤트 로그를 함께 제시하면 좋습니다."}',
    '[{"fileId":"30000000-0000-4000-8000-000000000003","vaultsageFileId":"vs_demo_metric_model_xlsx","name":"03_metric_model_and_kpi_map.xlsx","fileHash":"e339ce9e6fa2f9a2c6f561e7b1f65836f4fc73a21d67a8e295d3cb69a3861a0f","certifiedAt":"2026-04-27T09:00:00Z","reason":"성과 지표 정의와 계산 구조를 확인합니다."},{"fileId":"30000000-0000-4000-8000-000000000008","vaultsageFileId":"vs_demo_ab_test_xlsx","name":"08_ab_test_results.xlsx","fileHash":"6726505a881f0af50fae6d9fdb8e96f4a70b7b798b782c2d6b85a94b3920375c","certifiedAt":"2026-05-07T09:00:00Z","reason":"사용성 테스트와 개선 전후 결과를 담고 있습니다."}]',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
),
(
    '70000000-0000-4000-8000-000000000004',
    '60000000-0000-4000-8000-000000000001',
    3,
    '06_api_contract_openapi.yaml은 어떤 기술적 의사결정을 증명하며, 프론트엔드 구현 리스크를 어떻게 줄였나요?',
    'OpenAPI 계약에서 상품 성과, 캠페인 비용, 재고 위험 응답을 먼저 고정했습니다. 덕분에 프론트엔드는 임시 데이터 구조를 계속 바꾸지 않고 컴포넌트 상태와 빈 상태, 오류 상태를 먼저 설계할 수 있었습니다.',
    '{"feedback":"API 계약을 단순 문서가 아니라 구현 리스크 관리 도구로 설명한 점이 좋습니다. 시스템 근거로 충분히 기능합니다.","evidenceFiles":["06_api_contract_openapi.yaml","07_dashboard_components.tsx"],"missingProof":"백엔드 mock 서버나 계약 테스트 결과가 있으면 기술 깊이가 더 높아집니다."}',
    '[{"fileId":"30000000-0000-4000-8000-000000000006","vaultsageFileId":"vs_demo_openapi_yaml","name":"06_api_contract_openapi.yaml","fileHash":"0dd2703d83c02b27e9f8d83d583c3c64c760e4d11f7b7fd2db072aa844d4417e","certifiedAt":"2026-05-01T09:00:00Z","reason":"데이터 계약과 시스템 구조를 보여줍니다."},{"fileId":"30000000-0000-4000-8000-000000000007","vaultsageFileId":"vs_demo_component_tsx","name":"07_dashboard_components.tsx","fileHash":"2a8a4f92f623bf532f71e56b82c2b3f4cf915ea56a95d2dfaa8b868a9a751ced","certifiedAt":"2026-05-03T09:00:00Z","reason":"계약이 프론트엔드 구현에 반영된 근거입니다."}]',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
),
(
    '70000000-0000-4000-8000-000000000005',
    '60000000-0000-4000-8000-000000000001',
    4,
    '11_launch_retrospective.pdf를 보면 아직 부족한 증거는 무엇이고, 다음 버전에서 무엇을 보강하겠습니까?',
    '회고 문서에서 장기 운영 지표와 실제 배포 후 로그가 부족하다고 정리했습니다. 다음 버전에서는 2주 이상 이벤트 로그를 수집하고, 운영자가 실제로 어떤 알림에서 행동했는지 추적해 임팩트를 더 강하게 증명하겠습니다.',
    '{"feedback":"부족한 증거를 숨기지 않고 다음 실험 계획과 연결한 답변입니다. 공개 리뷰에서 신뢰를 주는 방식입니다.","evidenceFiles":["11_launch_retrospective.pdf","08_ab_test_results.xlsx"],"missingProof":"장기 운영 로그와 실제 사용자 코멘트 원문이 추가되면 좋습니다."}',
    '[{"fileId":"30000000-0000-4000-8000-000000000011","vaultsageFileId":"vs_demo_retro_pdf","name":"11_launch_retrospective.pdf","fileHash":"9d049b7da3d2ad88fb1a94d77841c52f308e9f4b820fa08a55fd347c1fc0a7b7","certifiedAt":"2026-05-15T09:00:00Z","reason":"남은 리스크와 다음 실험 계획을 확인합니다."},{"fileId":"30000000-0000-4000-8000-000000000008","vaultsageFileId":"vs_demo_ab_test_xlsx","name":"08_ab_test_results.xlsx","fileHash":"6726505a881f0af50fae6d9fdb8e96f4a70b7b798b782c2d6b85a94b3920375c","certifiedAt":"2026-05-07T09:00:00Z","reason":"현재까지의 실험 결과와 한계를 보여줍니다."}]',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
)
ON CONFLICT (session_id, question_index) DO UPDATE SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    feedback = EXCLUDED.feedback,
    evidence_json = EXCLUDED.evidence_json,
    answered_at = EXCLUDED.answered_at;

COMMIT;
