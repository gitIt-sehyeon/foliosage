-- Additional backend-heavy demo portfolio for the FolioSage demo account.

BEGIN;

UPDATE users
SET
    email = 'jaydenjeongdev@gmail.com',
    name = '정세현',
    bio = '분산 시스템과 백엔드 플랫폼을 깊게 파고드는 개발자입니다. 시스템 설계, 장애 격리, 성능 튜닝, 증거 기반 의사결정을 포트폴리오에서 함께 보여주는 방식을 중요하게 봅니다.',
    username = 'jaydenjeong',
    linkedin_url = 'https://www.linkedin.com/in/jaydenjeongdev',
    github_url = 'https://github.com/jaydenjeongdev'
WHERE id = '10000000-0000-4000-8000-000000000001';

INSERT INTO portfolios (
    id, user_id, title, description, organizer_id, directory_id, share_code, vaultsage_share_id,
    is_published, created_at, organize_status, organize_completed_at, view_count, download_count
) VALUES (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Event-Sourced Settlement Core for High-Volume Marketplace',
    '대규모 마켓플레이스의 주문, 결제, 정산, 환불 흐름을 이벤트 소싱 기반으로 재설계한 백엔드 플랫폼 프로젝트입니다. 멱등성 키, Outbox 패턴, Kafka 파티셔닝, PostgreSQL 락 경합 완화, 정산 감사 로그, 장애 복구 리허설까지 기술 근거 파일로 공개합니다.',
    'org_demo_settlement_core_2026',
    'dir_demo_settlement_core_2026',
    'FS-BACKEND-2026',
    'share_demo_settlement_core_2026',
    TRUE,
    NOW() - INTERVAL '27 days',
    'done',
    NOW() - INTERVAL '26 days 18 hours',
    2194,
    412
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
('31000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','vs_backend_architecture_pdf','01_architecture_decision_record.pdf','1a2e7d0fc8f5f8b9b13d6a8c20135e4ec1ac5b98738d5cbf47b42f82112fb901',2181120,'application/pdf',NOW() - INTERVAL '26 days',NOW() - INTERVAL '26 days','이벤트 소싱 채택 배경, 읽기 모델 분리, 정산 불변성 요구사항을 정리한 ADR입니다.','document',97,'아키텍처 의사결정과 트레이드오프를 설명하는 핵심 문서입니다.',FALSE),
('31000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','vs_backend_domain_model_png','02_domain_event_model.png','e3af6b595e4932be167219b211ef4dd8f0da0c278e1f5e9a71c0a2f3d3ac4502',1328128,'image/png',NOW() - INTERVAL '25 days',NOW() - INTERVAL '25 days','OrderPlaced, PaymentCaptured, SettlementAccrued, RefundIssued 이벤트와 aggregate 경계를 시각화한 모델입니다.','visual',96,'도메인 이벤트와 aggregate 경계를 보여주는 비주얼 근거입니다.',FALSE),
('31000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','vs_backend_kafka_yaml','03_kafka_topic_partition_plan.yaml','76d2bd38b837da304443f4dd1782fe84f7759b0d2312498c5f71cb85f41c9217',148480,'application/yaml',NOW() - INTERVAL '24 days',NOW() - INTERVAL '24 days','주문 단위 ordering을 보장하기 위한 topic, partition key, retention, DLQ 정책입니다.','system',98,'Kafka 토픽과 파티션 전략을 정의한 시스템 파일입니다.',FALSE),
('31000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000002','vs_backend_outbox_java','04_transactional_outbox_worker.java','a84f9283a67edb60e0d9a7a5e507d79e79675e7a4319502cc0c71f6fefc2b2d5',286720,'text/x-java-source',NOW() - INTERVAL '22 days',NOW() - INTERVAL '22 days','PostgreSQL SKIP LOCKED와 재시도 backoff를 사용해 Outbox 이벤트를 안전하게 발행하는 워커 코드입니다.','system',99,'핵심 백엔드 구현 코드이며 장애 복구와 중복 발행 방어를 보여줍니다.',FALSE),
('31000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000002','vs_backend_idempotency_java','05_idempotency_key_filter.java','dc8a93e0a9e3c42ff1f16df65f6fc0aa1f33edb9b3d58394d0a1b7e4f20ee7ad',193536,'text/x-java-source',NOW() - INTERVAL '21 days',NOW() - INTERVAL '21 days','결제 승인, 환불, 정산 재처리 요청을 idempotency key와 request hash로 보호하는 API 필터입니다.','system',97,'중복 요청과 재시도 상황을 방어하는 백엔드 안정성 코드입니다.',FALSE),
('31000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000002','vs_backend_schema_sql','06_postgres_schema_and_indexes.sql','19f3c92d700d05aa11b16c038f092c60233bb8d59e1d7724f2fb15d56cae32a2',231424,'application/sql',NOW() - INTERVAL '20 days',NOW() - INTERVAL '20 days','append-only event_store, outbox_events, settlement_projection 인덱스와 unique constraint 설계입니다.','system',96,'저장소 모델, 인덱스, 정합성 제약을 증명하는 SQL 파일입니다.',FALSE),
('31000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000002','vs_backend_load_test_md','07_load_test_report_10k_tps.md','4e0f309d4b07b3d2cdbf51df358069338df4c17e7d033baf6086bcd2d80f19be',774144,'text/markdown',NOW() - INTERVAL '17 days',NOW() - INTERVAL '17 days','10k TPS synthetic workload에서 p95 latency, consumer lag, DB lock wait를 측정한 부하 테스트 리포트입니다.','document',95,'성능 개선과 병목 분석을 수치로 보여주는 문서입니다.',FALSE),
('31000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000002','vs_backend_incident_playbook_pdf','08_failure_recovery_playbook.pdf','b7023fcfc497e27b8d19df9459bb28d730f3a656d9ef52b227b2a5d13357a2ce',1572864,'application/pdf',NOW() - INTERVAL '15 days',NOW() - INTERVAL '15 days','Kafka 지연, DB failover, 중복 결제 webhook, projection 재빌드 시나리오별 복구 절차입니다.','document',93,'장애 대응과 운영 복구 능력을 보여주는 문서입니다.',FALSE),
('31000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000002','vs_backend_observability_json','09_observability_dashboard.json','83b9a707e4e9b989b2681b6374a3fb2750b24a7e4fd3104ac72fc74dc623acaf',362496,'application/json',NOW() - INTERVAL '13 days',NOW() - INTERVAL '13 days','consumer lag, outbox retry, settlement drift, projection freshness를 추적하는 Grafana dashboard JSON입니다.','system',94,'운영 관측성과 알림 설계를 보여주는 시스템 산출물입니다.',FALSE),
('31000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000002','vs_backend_final_handoff_zip','10_settlement_core_handoff_bundle.zip','fe8c19425e1c0c79e6692844c0447fc6c052ae807b71a2f94f55506d5dc19aa8',9437184,'application/zip',NOW() - INTERVAL '11 days',NOW() - INTERVAL '11 days','ADR, schema, worker 코드, 테스트 결과, 운영 playbook을 묶은 최종 핸드오프 번들입니다.','deliverable',98,'전체 백엔드 프로젝트를 제출 가능한 형태로 묶은 최종 산출물입니다.',FALSE)
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
    ('41000000-0000-4000-8000-' || lpad(row_number() over (ORDER BY id)::text, 12, '0'))::uuid,
    id,
    '/certificates/demo-backend/' || id || '.pdf',
    certified_at
FROM portfolio_files
WHERE portfolio_id = '20000000-0000-4000-8000-000000000002'
ON CONFLICT (file_id) DO UPDATE SET
    pdf_path = EXCLUDED.pdf_path,
    issued_at = EXCLUDED.issued_at;

INSERT INTO portfolio_stories (
    id, portfolio_id, summary, role, problem, solution, impact,
    evidence_highlights_json, missing_proof_json, interview_questions_json,
    status, error_message, generated_at, updated_at
) VALUES (
    '51000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '이 프로젝트는 주문, 결제, 정산, 환불이 서로 다른 트랜잭션 경계에서 발생하는 마켓플레이스 백엔드를 이벤트 소싱 기반 정산 코어로 재설계한 작업입니다. 핵심은 정산 금액의 불변성, 재처리 가능성, 중복 요청 방어, 장애 후 복구 가능성을 코드와 운영 문서로 동시에 증명하는 것입니다.',
    '저는 백엔드 설계와 핵심 구현을 담당했습니다. aggregate와 domain event 모델링, Outbox worker, idempotency filter, PostgreSQL schema/index 설계, Kafka partition 전략, 부하 테스트, 장애 복구 playbook 작성까지 end-to-end로 수행했습니다.',
    '기존 시스템은 결제 webhook 재시도와 정산 batch 재처리가 겹치면 중복 정산 또는 projection drift가 발생할 위험이 있었습니다. 또한 장애 후 어떤 이벤트가 발행되었고 어떤 projection이 최신인지 추적하기 어려워 운영자가 수동 SQL로 상태를 확인해야 했습니다.',
    'append-only event_store를 기준 진실로 두고, Transactional Outbox로 DB commit과 message publish의 불일치를 줄였습니다. Kafka partition key를 orderId로 고정해 주문 단위 순서를 보장했고, idempotency key와 request hash로 외부 재시도 요청을 방어했습니다. projection은 재빌드 가능하게 설계하고, consumer lag와 settlement drift를 dashboard로 관측했습니다.',
    '10k TPS synthetic workload에서 p95 latency와 consumer lag를 측정하며 병목을 확인했고, SKIP LOCKED 기반 outbox polling과 인덱스 조정으로 lock wait를 줄였습니다. 장애 복구 playbook을 통해 Kafka 지연, DB failover, projection 재빌드 시나리오를 반복 리허설할 수 있게 했습니다.',
    '[
      {"fileId":"31000000-0000-4000-8000-000000000001","vaultsageFileId":"vs_backend_architecture_pdf","fileName":"01_architecture_decision_record.pdf","reason":"이벤트 소싱과 Outbox 채택 이유, 트레이드오프, 정산 불변성 요구사항을 설명합니다."},
      {"fileId":"31000000-0000-4000-8000-000000000003","vaultsageFileId":"vs_backend_kafka_yaml","fileName":"03_kafka_topic_partition_plan.yaml","reason":"주문 단위 ordering과 DLQ 운영 전략을 기술적으로 증명합니다."},
      {"fileId":"31000000-0000-4000-8000-000000000004","vaultsageFileId":"vs_backend_outbox_java","fileName":"04_transactional_outbox_worker.java","reason":"DB commit 이후 안전한 이벤트 발행과 재시도 제어를 구현한 핵심 코드입니다."},
      {"fileId":"31000000-0000-4000-8000-000000000006","vaultsageFileId":"vs_backend_schema_sql","fileName":"06_postgres_schema_and_indexes.sql","reason":"event_store, outbox, projection 테이블과 인덱스로 정합성 제약을 확인할 수 있습니다."},
      {"fileId":"31000000-0000-4000-8000-000000000007","vaultsageFileId":"vs_backend_load_test_md","fileName":"07_load_test_report_10k_tps.md","reason":"성능 목표, 병목, latency, lock wait 개선을 수치로 보여줍니다."},
      {"fileId":"31000000-0000-4000-8000-000000000008","vaultsageFileId":"vs_backend_incident_playbook_pdf","fileName":"08_failure_recovery_playbook.pdf","reason":"장애 상황에서 시스템을 어떻게 복구하고 검증하는지 보여줍니다."}
    ]',
    '["실제 production traffic profile과 synthetic workload의 차이를 더 명확히 설명하면 좋습니다.","장기간 운영 후 settlement drift가 0으로 유지되었는지 추적한 월간 리포트가 추가되면 강합니다.","팀 프로젝트라면 schema, worker, observability 중 본인 소유 범위를 더 세밀하게 표시하면 좋습니다."]',
    '["왜 단순 CRUD와 batch 정산이 아니라 이벤트 소싱을 선택했나요?","Transactional Outbox가 정확히 어떤 failure window를 줄이나요?","Kafka partition key를 orderId로 둔 선택의 장점과 한계는 무엇인가요?","PostgreSQL SKIP LOCKED polling에서 starvation이나 retry storm은 어떻게 방어했나요?","projection drift가 발생했을 때 어느 파일을 근거로 복구 절차를 설명할 수 있나요?"]',
    'ready',
    NULL,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
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
    '61000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'completed',
    'conv_demo_backend_2026',
    'session_demo_backend_2026',
    '["왜 batch 정산 대신 event-sourced settlement core를 선택했는지 01_architecture_decision_record.pdf를 근거로 설명해 주세요.","04_transactional_outbox_worker.java와 06_postgres_schema_and_indexes.sql를 기준으로 중복 발행과 lock 경합을 어떻게 다뤘나요?","03_kafka_topic_partition_plan.yaml에서 partition key를 orderId로 둔 선택의 장점과 한계를 설명해 주세요.","07_load_test_report_10k_tps.md를 기준으로 병목을 어떻게 찾고 어떤 튜닝을 했나요?","08_failure_recovery_playbook.pdf와 09_observability_dashboard.json을 연결해 장애 후 정합성 검증 절차를 설명해 주세요."]',
    '{"overallScore":93,"categories":[{"name":"독창성","score":90,"rationale":"정산 도메인을 이벤트 소싱, Outbox, 관측성, 복구 리허설까지 연결해 깊게 다룹니다."},{"name":"기술 깊이","score":96,"rationale":"Kafka ordering, PostgreSQL lock, idempotency, projection rebuild 같은 실무 난제를 구체적으로 다룹니다."},{"name":"근거 강도","score":94,"rationale":"ADR, schema, worker code, load test, playbook, dashboard가 서로 보완됩니다."},{"name":"스토리 명확성","score":91,"rationale":"문제, 설계 선택, failure mode, 운영 검증이 일관된 백엔드 서사로 이어집니다."},{"name":"부족한 증거","score":84,"rationale":"실제 운영 장기 지표와 팀 내 소유 범위가 더 있으면 거의 완성형입니다."}],"missingProof":["production traffic과 synthetic workload 비교","월간 settlement drift 리포트","팀 내 ownership matrix"],"summary":"백엔드 포트폴리오로 매우 강합니다. 단순 구현 목록이 아니라 정합성, 장애, 성능, 운영까지 방어 가능한 구조입니다. 면접에서는 Outbox failure window와 projection rebuild 전략을 깊게 물어볼 가치가 있습니다."}',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
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
('71000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000001',0,'왜 batch 정산 대신 event-sourced settlement core를 선택했는지 01_architecture_decision_record.pdf를 근거로 설명해 주세요.','정산은 나중에 다시 계산해야 하는 경우가 많고, 결제와 환불 이벤트가 비동기로 도착합니다. 그래서 현재 상태만 저장하는 batch 방식보다 append-only event log를 기준 진실로 두는 편이 감사와 재처리에 유리했습니다. ADR에는 이 선택이 조회 복잡도를 높이는 대신 복구 가능성과 추적성을 얻는 trade-off라고 정리했습니다.','{"feedback":"설계 선택의 이유와 trade-off를 균형 있게 설명했습니다. 단순히 유행하는 패턴이 아니라 정산 도메인의 감사 가능성 요구와 연결한 점이 강합니다.","evidenceFiles":["01_architecture_decision_record.pdf"],"missingProof":"조회 모델 복잡도 증가를 어떻게 운영 비용으로 관리했는지 추가하면 더 좋습니다."}','[{"fileId":"31000000-0000-4000-8000-000000000001","vaultsageFileId":"vs_backend_architecture_pdf","name":"01_architecture_decision_record.pdf","fileHash":"1a2e7d0fc8f5f8b9b13d6a8c20135e4ec1ac5b98738d5cbf47b42f82112fb901","certifiedAt":"2026-04-29T09:00:00Z","reason":"이벤트 소싱 채택 배경과 trade-off를 설명합니다."}]',NOW() - INTERVAL '7 days',NOW() - INTERVAL '7 days'),
('71000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001',1,'04_transactional_outbox_worker.java와 06_postgres_schema_and_indexes.sql를 기준으로 중복 발행과 lock 경합을 어떻게 다뤘나요?','Outbox row는 aggregate transaction과 같이 commit하고, worker는 SKIP LOCKED로 작은 batch를 가져와 publish 후 상태를 바꿉니다. event_id와 idempotency key에는 unique constraint를 두었고 retry_count와 next_attempt_at으로 retry storm을 줄였습니다. lock wait는 created_at과 status 복합 인덱스를 조정해 줄였습니다.','{"feedback":"구현 코드와 DB schema를 함께 설명해 신뢰도가 높습니다. SKIP LOCKED, unique constraint, backoff를 모두 failure mode와 연결했습니다.","evidenceFiles":["04_transactional_outbox_worker.java","06_postgres_schema_and_indexes.sql"],"missingProof":"worker concurrency별 lock wait 비교 그래프가 있으면 더 강합니다."}','[{"fileId":"31000000-0000-4000-8000-000000000004","vaultsageFileId":"vs_backend_outbox_java","name":"04_transactional_outbox_worker.java","fileHash":"a84f9283a67edb60e0d9a7a5e507d79e79675e7a4319502cc0c71f6fefc2b2d5","certifiedAt":"2026-05-03T09:00:00Z","reason":"Outbox worker 핵심 구현입니다."},{"fileId":"31000000-0000-4000-8000-000000000006","vaultsageFileId":"vs_backend_schema_sql","name":"06_postgres_schema_and_indexes.sql","fileHash":"19f3c92d700d05aa11b16c038f092c60233bb8d59e1d7724f2fb15d56cae32a2","certifiedAt":"2026-05-05T09:00:00Z","reason":"정합성과 인덱스 설계 근거입니다."}]',NOW() - INTERVAL '7 days',NOW() - INTERVAL '7 days'),
('71000000-0000-4000-8000-000000000003','61000000-0000-4000-8000-000000000001',2,'03_kafka_topic_partition_plan.yaml에서 partition key를 orderId로 둔 선택의 장점과 한계를 설명해 주세요.','orderId 기준 파티셔닝은 한 주문 안의 결제, 환불, 정산 이벤트 순서를 보장하기 좋습니다. 대신 merchant 단위 집계는 여러 partition을 읽어야 해서 projection 쪽 복잡도가 올라갑니다. 그래서 주문 정합성을 우선하고, merchant summary는 별도 projection으로 eventual consistency를 허용했습니다.','{"feedback":"ordering 보장과 집계 복잡도의 trade-off를 정확히 짚었습니다. 면접에서 더 깊게 파고들기 좋은 답변입니다.","evidenceFiles":["03_kafka_topic_partition_plan.yaml"],"missingProof":"hot order나 skewed key 방어 전략을 추가하면 완성도가 높아집니다."}','[{"fileId":"31000000-0000-4000-8000-000000000003","vaultsageFileId":"vs_backend_kafka_yaml","name":"03_kafka_topic_partition_plan.yaml","fileHash":"76d2bd38b837da304443f4dd1782fe84f7759b0d2312498c5f71cb85f41c9217","certifiedAt":"2026-05-02T09:00:00Z","reason":"Kafka partition과 DLQ 정책을 보여줍니다."}]',NOW() - INTERVAL '7 days',NOW() - INTERVAL '7 days'),
('71000000-0000-4000-8000-000000000004','61000000-0000-4000-8000-000000000001',3,'07_load_test_report_10k_tps.md를 기준으로 병목을 어떻게 찾고 어떤 튜닝을 했나요?','부하 테스트에서는 p95 latency보다 consumer lag와 DB lock wait가 먼저 튀었습니다. outbox polling batch size를 줄이고 status, next_attempt_at, created_at 인덱스를 바꾼 뒤 lock wait가 내려갔습니다. 또한 projection update를 주문 단위 upsert에서 시간 bucket 기반 bulk 처리로 바꿔 write amplification을 낮췄습니다.','{"feedback":"성능 병목을 지표로 찾고 튜닝으로 연결한 설명이 구체적입니다. 백엔드 역량을 강하게 보여줍니다.","evidenceFiles":["07_load_test_report_10k_tps.md","09_observability_dashboard.json"],"missingProof":"튜닝 전후 수치를 표로 직접 제시하면 더 좋습니다."}','[{"fileId":"31000000-0000-4000-8000-000000000007","vaultsageFileId":"vs_backend_load_test_md","name":"07_load_test_report_10k_tps.md","fileHash":"4e0f309d4b07b3d2cdbf51df358069338df4c17e7d033baf6086bcd2d80f19be","certifiedAt":"2026-05-08T09:00:00Z","reason":"성능 측정과 병목 분석 근거입니다."},{"fileId":"31000000-0000-4000-8000-000000000009","vaultsageFileId":"vs_backend_observability_json","name":"09_observability_dashboard.json","fileHash":"83b9a707e4e9b989b2681b6374a3fb2750b24a7e4fd3104ac72fc74dc623acaf","certifiedAt":"2026-05-12T09:00:00Z","reason":"운영 지표와 관측성 설계를 보여줍니다."}]',NOW() - INTERVAL '7 days',NOW() - INTERVAL '7 days'),
('71000000-0000-4000-8000-000000000005','61000000-0000-4000-8000-000000000001',4,'08_failure_recovery_playbook.pdf와 09_observability_dashboard.json을 연결해 장애 후 정합성 검증 절차를 설명해 주세요.','장애 후에는 먼저 outbox retry backlog와 consumer lag를 확인하고, settlement drift metric으로 projection과 event_store의 차이를 봅니다. drift가 있으면 playbook에 따라 특정 merchant나 기간 범위만 projection을 재빌드하고, 재빌드 완료 후 dashboard에서 freshness와 drift가 정상화됐는지 확인합니다.','{"feedback":"장애 감지, 범위 제한 복구, 검증까지 운영 절차가 잘 설명됐습니다. 단순 개발 포트폴리오보다 실무 깊이가 보입니다.","evidenceFiles":["08_failure_recovery_playbook.pdf","09_observability_dashboard.json"],"missingProof":"실제 장애 리허설 로그나 타임라인이 추가되면 더 설득력 있습니다."}','[{"fileId":"31000000-0000-4000-8000-000000000008","vaultsageFileId":"vs_backend_incident_playbook_pdf","name":"08_failure_recovery_playbook.pdf","fileHash":"b7023fcfc497e27b8d19df9459bb28d730f3a656d9ef52b227b2a5d13357a2ce","certifiedAt":"2026-05-10T09:00:00Z","reason":"장애 복구 절차를 설명합니다."},{"fileId":"31000000-0000-4000-8000-000000000009","vaultsageFileId":"vs_backend_observability_json","name":"09_observability_dashboard.json","fileHash":"83b9a707e4e9b989b2681b6374a3fb2750b24a7e4fd3104ac72fc74dc623acaf","certifiedAt":"2026-05-12T09:00:00Z","reason":"정합성 검증 지표와 dashboard 구성을 보여줍니다."}]',NOW() - INTERVAL '7 days',NOW() - INTERVAL '7 days')
ON CONFLICT (session_id, question_index) DO UPDATE SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    feedback = EXCLUDED.feedback,
    evidence_json = EXCLUDED.evidence_json,
    answered_at = EXCLUDED.answered_at;

COMMIT;
