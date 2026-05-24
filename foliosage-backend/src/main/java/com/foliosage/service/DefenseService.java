package com.foliosage.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.portfolio.DefenseDtos.*;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioDefenseSession;
import com.foliosage.entity.PortfolioDefenseTurn;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioDefenseSessionRepository;
import com.foliosage.repository.PortfolioDefenseTurnRepository;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.PortfolioStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class DefenseService {
    private static final int QUESTION_COUNT = 5;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final PortfolioDefenseSessionRepository sessionRepository;
    private final PortfolioDefenseTurnRepository turnRepository;
    private final VaultSageService vaultSageService;
    private final PortfolioStoryRepository storyRepository;

    @Transactional
    public DefenseSessionResponse start(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        if (!portfolio.isPublished() || portfolio.getShareCode() == null || portfolio.getShareCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Publish portfolio before starting defense");
        }
        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);
        if (files.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload files before starting defense");

        String sessionId = UUID.randomUUID().toString();
        PublicChatResult result = callVaultSage(portfolio.getShareCode(), buildQuestionPrompt(portfolio, files), null, sessionId);
        List<String> questions = parseQuestions(result.message());
        String questionsJson = writeJson(questions);

        PortfolioDefenseSession session = sessionRepository.save(PortfolioDefenseSession.builder()
                .portfolio(portfolio)
                .status("active")
                .vaultsageSessionId(sessionId)
                .vaultsageConversationId(result.conversationId())
                .questionsJson(questionsJson)
                .build());

        for (int i = 0; i < questions.size(); i++) {
            turnRepository.save(PortfolioDefenseTurn.builder()
                    .session(session)
                    .questionIndex(i)
                    .question(questions.get(i))
                    .evidenceJson("[]")
                    .build());
        }
        return toSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public DefenseSessionResponse latest(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        return sessionRepository.findFirstByPortfolioOrderByCreatedAtDesc(portfolio)
                .map(this::toSessionResponse)
                .orElse(null);
    }

    @Transactional
    public DefenseSessionResponse answer(String userEmail, UUID portfolioId, UUID sessionId, String answer) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        PortfolioDefenseSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI review session not found"));
        if (!session.getPortfolio().getId().equals(portfolio.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if ("completed".equals(session.getStatus())) return toSessionResponse(session);

        List<PortfolioDefenseTurn> turns = turnRepository.findBySessionOrderByQuestionIndexAsc(session);
        PortfolioDefenseTurn turn = turns.stream()
                .filter(t -> t.getAnswer() == null || t.getAnswer().isBlank())
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "AI review session already answered"));

        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);
        PublicChatResult result = callVaultSage(
                portfolio.getShareCode(),
                buildEvaluationPrompt(turn.getQuestion(), answer, portfolio, files),
                session.getVaultsageConversationId(),
                session.getVaultsageSessionId());
        if (result.conversationId() != null && !result.conversationId().isBlank()) {
            session.setVaultsageConversationId(result.conversationId());
        }

        Evaluation evaluation = parseEvaluation(result.message(), result.metaData(), files);
        turn.setAnswer(answer);
        turn.setFeedback(evaluation.feedback());
        turn.setEvidenceJson(writeJson(evaluation.evidence()));
        turn.setAnsweredAt(OffsetDateTime.now());
        turnRepository.save(turn);

        boolean complete = turn.getQuestionIndex() >= QUESTION_COUNT - 1;
        if (complete) {
            PublicChatResult scoreResult = callVaultSage(
                    portfolio.getShareCode(),
                    buildScorecardPrompt(turnRepository.findBySessionOrderByQuestionIndexAsc(session), portfolio, files),
                    session.getVaultsageConversationId(),
                    session.getVaultsageSessionId());
            DefenseScorecardDto scorecard = parseScorecard(scoreResult.message());
            session.setScorecardJson(writeJson(scorecard));
            session.setStatus("completed");
            session.setCompletedAt(OffsetDateTime.now());
            if (scoreResult.conversationId() != null && !scoreResult.conversationId().isBlank()) {
                session.setVaultsageConversationId(scoreResult.conversationId());
            }
        }
        sessionRepository.save(session);
        return toSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public PublicDefenseResponse publicDefense(String shareCode) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        Optional<PortfolioDefenseSession> latest = sessionRepository
                .findFirstByPortfolioAndStatusOrderByCompletedAtDesc(portfolio, "completed");
        if (latest.isEmpty()) return new PublicDefenseResponse(false, null, 0, 0);
        DefenseSessionResponse session = toSessionResponse(latest.get());
        Set<UUID> cited = new HashSet<>();
        int total = 0;
        for (DefenseTurnResponse turn : session.turns()) {
            total += turn.evidence().size();
            turn.evidence().forEach(e -> cited.add(e.fileId()));
        }
        return new PublicDefenseResponse(true, session, cited.size(), total);
    }

    List<String> parseQuestions(String raw) {
        JsonNode node = parseJsonPayload(raw);
        List<String> questions = new ArrayList<>();
        if (node != null) {
            JsonNode items = node.has("questions") ? node.path("questions") : node;
            if (items.isArray()) {
                for (JsonNode item : items) {
                    String value = item.isTextual() ? item.asText() : item.path("question").asText("");
                    if (!value.isBlank()) questions.add(value.trim());
                }
            }
        }
        if (questions.size() < QUESTION_COUNT) questions = defaultQuestions();
        return questions.subList(0, QUESTION_COUNT);
    }

    Evaluation parseEvaluation(String rawMessage, JsonNode metaData, List<PortfolioFile> files) {
        JsonNode node = parseJsonPayload(rawMessage);
        String feedback = rawMessage;
        String missingProof = "";
        List<String> evidenceNames = new ArrayList<>();
        if (node != null && node.isObject()) {
            feedback = node.path("feedback").asText(node.path("rationale").asText(rawMessage));
            missingProof = node.path("missingProof").asText(node.path("missing_proof").asText(""));
            collectEvidenceNames(node.path("evidenceFiles"), evidenceNames);
            collectEvidenceNames(node.path("evidence_files"), evidenceNames);
        }
        collectEvidenceNames(metaData, evidenceNames);
        if (evidenceNames.isEmpty()) evidenceNames.add(rawMessage);
        List<EvidenceChipDto> evidence = matchEvidence(evidenceNames, files, missingProof, true);
        return new Evaluation(feedback, evidence);
    }

    public List<EvidenceChipDto> extractChatEvidence(String rawMessage, JsonNode metaData, List<PortfolioFile> files) {
        List<String> hints = new ArrayList<>();
        collectEvidenceNames(metaData, hints);
        if (rawMessage != null && !rawMessage.isBlank()) hints.add(rawMessage);
        return matchEvidence(hints, files, "", false);
    }

    List<EvidenceChipDto> matchEvidence(List<String> hints, List<PortfolioFile> files, String reason) {
        return matchEvidence(hints, files, reason, true);
    }

    private List<EvidenceChipDto> matchEvidence(List<String> hints, List<PortfolioFile> files, String reason, boolean fallbackToFirstFile) {
        List<EvidenceChipDto> matches = new ArrayList<>();
        Set<UUID> seen = new HashSet<>();
        String joinedHints = String.join("\n", hints).toLowerCase(Locale.ROOT);
        for (PortfolioFile file : files) {
            String name = file.getName() != null ? file.getName() : "";
            String vaultsageId = file.getVaultsageFileId() != null ? file.getVaultsageFileId() : "";
            boolean matched = !vaultsageId.isBlank() && joinedHints.contains(vaultsageId.toLowerCase(Locale.ROOT));
            if (!matched && !name.isBlank()) {
                matched = joinedHints.contains(name.toLowerCase(Locale.ROOT))
                        || containsFilenameToken(joinedHints, name);
            }
            if (matched && seen.add(file.getId())) {
                matches.add(toEvidenceChip(file, reason.isBlank() ? "AI 포트폴리오 리뷰에서 참조한 근거입니다." : reason));
            }
        }
        if (fallbackToFirstFile && matches.isEmpty() && !files.isEmpty()) {
            PortfolioFile file = files.get(0);
            matches.add(toEvidenceChip(file, "AI 응답이 포트폴리오 파일을 참조했지만 정확한 인용 파일을 반환하지 않았습니다."));
        }
        return matches.size() > 4 ? matches.subList(0, 4) : matches;
    }

    DefenseScorecardDto parseScorecard(String raw) {
        JsonNode node = parseJsonPayload(raw);
        if (node != null && node.isObject()) {
            JsonNode categoriesNode = node.path("categories");
            List<ScoreCategoryDto> categories = new ArrayList<>();
            if (categoriesNode.isArray()) {
                for (JsonNode category : categoriesNode) {
                    categories.add(new ScoreCategoryDto(
                            category.path("name").asText("Category"),
                            clampScore(category.path("score").asInt(70)),
                            category.path("rationale").asText("")
                    ));
                }
            }
            if (!categories.isEmpty()) {
                return new DefenseScorecardDto(
                        clampScore(node.path("overallScore").asInt(node.path("overall_score").asInt(average(categories)))),
                        categories,
                        readStringList(node.path("missingProof").isMissingNode() ? node.path("missing_proof") : node.path("missingProof")),
                        node.path("summary").asText("AI 리뷰가 완료되었습니다.")
                );
            }
        }
        List<ScoreCategoryDto> categories = List.of(
                new ScoreCategoryDto("독창성", 78, "창작 의도는 설명되어 있으나 본인만의 기여를 더 직접적으로 증명할 필요가 있습니다."),
                new ScoreCategoryDto("기술 깊이", 76, "기술적 선택은 드러나지만 구현 산출물로 더 강화할 수 있습니다."),
                new ScoreCategoryDto("근거 강도", 72, "업로드된 파일이 스토리를 뒷받침하지만 과정 증거를 더 보강할 여지가 있습니다."),
                new ScoreCategoryDto("스토리 명확성", 80, "전체 서사는 일관적이며 공개 검토에 활용할 수 있습니다."),
                new ScoreCategoryDto("부족한 증거", 68, "원본 파일, 초안, 결과 지표를 추가하면 증거 공백을 줄일 수 있습니다.")
        );
        return new DefenseScorecardDto(average(categories), categories, List.of("작업 과정 산출물이나 측정 가능한 결과를 더 추가하세요."), raw);
    }

    private DefenseSessionResponse toSessionResponse(PortfolioDefenseSession session) {
        List<PortfolioDefenseTurn> turns = turnRepository.findBySessionOrderByQuestionIndexAsc(session);
        List<DefenseTurnResponse> turnDtos = turns.stream().map(this::toTurnResponse).toList();
        int current = turnDtos.stream().filter(t -> t.answer() != null && !t.answer().isBlank()).mapToInt(DefenseTurnResponse::questionIndex).max().orElse(-1) + 1;
        DefenseScorecardDto scorecard = parseStoredScorecard(session.getScorecardJson());
        return new DefenseSessionResponse(
                session.getId(),
                session.getStatus(),
                Math.min(current, QUESTION_COUNT - 1),
                QUESTION_COUNT,
                turnDtos,
                scorecard,
                session.getCreatedAt(),
                session.getCompletedAt()
        );
    }

    private DefenseTurnResponse toTurnResponse(PortfolioDefenseTurn turn) {
        return new DefenseTurnResponse(
                turn.getId(),
                turn.getQuestionIndex(),
                turn.getQuestion(),
                turn.getAnswer(),
                turn.getFeedback(),
                readEvidence(turn.getEvidenceJson()),
                turn.getAnswer() != null && !turn.getAnswer().isBlank()
        );
    }

    private PublicChatResult callVaultSage(String shareCode, String message, String conversationId, String sessionId) {
        String raw;
        try {
            raw = vaultSageService.publicChat(shareCode, message, conversationId, sessionId);
        } catch (WebClientResponseException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "VaultSage AI 리뷰 요청에 실패했습니다. 포트폴리오 공개 링크가 유효한지 확인해 주세요.");
        }
        try {
            JsonNode node = MAPPER.readTree(raw);
            return new PublicChatResult(
                    node.path("message").asText(node.path("content").asText(node.path("response").asText(raw))),
                    node.path("conversation_id").asText(node.path("id").asText(conversationId)),
                    node.path("meta_data").isMissingNode() ? null : node.path("meta_data")
            );
        } catch (Exception e) {
            return new PublicChatResult(raw, conversationId, null);
        }
    }

    String buildQuestionPrompt(Portfolio portfolio, List<PortfolioFile> files) {
        return """
                %s
                당신은 AI 포트폴리오 심사위원입니다. 이 포트폴리오에 대한 방어 질문을 정확히 5개 생성하세요.
                JSON만 반환하세요: {"questions":["..."]}.
                질문은 작성자 본인성, 디자인/기술 의사결정, 측정 가능한 임팩트, 근거 강도, 독창성, 부족한 증거를 다뤄야 합니다.
                질문을 고를 때 전체 파일 목록을 사용하세요. 첫 번째 파일에만 집중하지 말고, 가능하면 서로 다른 파일 3개 이상을 다루세요.
                질문 안에 관련 파일명을 언급해 작성자가 여러 업로드 파일의 근거를 방어하게 하세요.
                포트폴리오: %s
                설명: %s
                생성된 스토리:
                %s
                파일:
                %s
                """.formatted(
                AiLanguageInstructions.KOREAN_ONLY,
                portfolio.getTitle(),
                nullToEmpty(portfolio.getDescription()),
                storyContext(portfolio),
                fileManifest(files));
    }

    private String buildEvaluationPrompt(String question, String answer, Portfolio portfolio, List<PortfolioFile> files) {
        return """
                %s
                공유된 포트폴리오 파일을 기준으로 작성자의 답변을 평가하세요.
                JSON만 반환하세요: {"feedback":"...", "evidenceFiles":["exact filename or file id"], "missingProof":"..."}.
                질문: %s
                답변: %s
                생성된 스토리:
                %s
                사용 가능한 파일:
                %s
                """.formatted(
                AiLanguageInstructions.KOREAN_ONLY,
                question,
                answer,
                storyContext(portfolio),
                fileManifest(files));
    }

    private String buildScorecardPrompt(List<PortfolioDefenseTurn> turns, Portfolio portfolio, List<PortfolioFile> files) {
        StringBuilder transcript = new StringBuilder();
        for (PortfolioDefenseTurn turn : turns) {
            transcript.append("Q").append(turn.getQuestionIndex() + 1).append(": ").append(turn.getQuestion()).append("\n");
            transcript.append("A").append(turn.getQuestionIndex() + 1).append(": ").append(nullToEmpty(turn.getAnswer())).append("\n");
            transcript.append("Feedback: ").append(nullToEmpty(turn.getFeedback())).append("\n\n");
        }
        return """
                %s
                최종 포트폴리오 방어 평가표를 만드세요.
                JSON만 반환하세요: {"overallScore":0-100,"categories":[{"name":"독창성","score":0-100,"rationale":"..."}],"missingProof":["..."],"summary":"..."}.
                필수 카테고리: 독창성, 기술 깊이, 근거 강도, 스토리 명확성, 부족한 증거.
                대화 기록:
                %s
                생성된 스토리:
                %s
                파일:
                %s
                """.formatted(
                AiLanguageInstructions.KOREAN_ONLY,
                transcript,
                storyContext(portfolio),
                fileManifest(files));
    }

    private String storyContext(Portfolio portfolio) {
        if (portfolio == null || storyRepository == null) return "";
        return storyRepository.findByPortfolio(portfolio)
                .map(story -> """
                        Summary: %s
                        Role: %s
                        Problem: %s
                        Solution: %s
                        Impact: %s
                        Evidence highlights: %s
                        Missing proof: %s
                        Interview questions: %s
                        """.formatted(
                        nullToEmpty(story.getSummary()),
                        nullToEmpty(story.getRole()),
                        nullToEmpty(story.getProblem()),
                        nullToEmpty(story.getSolution()),
                        nullToEmpty(story.getImpact()),
                        nullToEmpty(story.getEvidenceHighlightsJson()),
                        nullToEmpty(story.getMissingProofJson()),
                        nullToEmpty(story.getInterviewQuestionsJson())))
                .orElse("");
    }

    private String fileManifest(List<PortfolioFile> files) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < files.size(); i++) {
            PortfolioFile file = files.get(i);
            sb.append("- [").append(i + 1).append("/").append(files.size()).append("] ")
                    .append(file.getName())
                    .append(" | file_id=").append(file.getVaultsageFileId())
                    .append(" | hash=").append(file.getFileHash() == null ? "" : file.getFileHash().substring(0, Math.min(12, file.getFileHash().length())))
                    .append(" | certified_at=").append(file.getCertifiedAt())
                    .append(" | description=").append(nullToEmpty(file.getDescription()))
                    .append("\n");
        }
        return sb.toString();
    }

    private void collectEvidenceNames(JsonNode node, List<String> out) {
        if (node == null || node.isMissingNode() || node.isNull()) return;
        if (node.isTextual()) {
            out.add(node.asText());
        } else if (node.isArray()) {
            for (JsonNode item : node) collectEvidenceNames(item, out);
        } else if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                if (field.getKey().toLowerCase(Locale.ROOT).contains("file")
                        || field.getKey().toLowerCase(Locale.ROOT).contains("source")
                        || field.getKey().toLowerCase(Locale.ROOT).contains("citation")
                        || field.getValue().isObject()
                        || field.getValue().isArray()) {
                    collectEvidenceNames(field.getValue(), out);
                }
            }
        }
    }

    private JsonNode parseJsonPayload(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }
        int objectStart = trimmed.indexOf('{');
        int arrayStart = trimmed.indexOf('[');
        int start = objectStart >= 0 && arrayStart >= 0 ? Math.min(objectStart, arrayStart) : Math.max(objectStart, arrayStart);
        if (start > 0) trimmed = trimmed.substring(start);
        try { return MAPPER.readTree(trimmed); }
        catch (Exception e) { return null; }
    }

    private List<EvidenceChipDto> readEvidence(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return MAPPER.readerForListOf(EvidenceChipDto.class).readValue(json);
        } catch (Exception e) { return List.of(); }
    }

    private DefenseScorecardDto parseStoredScorecard(String json) {
        if (json == null || json.isBlank()) return null;
        try { return MAPPER.readValue(json, DefenseScorecardDto.class); }
        catch (Exception e) { return null; }
    }

    private String writeJson(Object value) {
        try { return MAPPER.writeValueAsString(value); }
        catch (Exception e) { throw new RuntimeException("Failed to serialize defense data", e); }
    }

    private EvidenceChipDto toEvidenceChip(PortfolioFile file, String reason) {
        return new EvidenceChipDto(file.getId(), file.getVaultsageFileId(), file.getName(), file.getFileHash(),
                file.getCertifiedAt() != null ? file.getCertifiedAt().toString() : null, reason);
    }

    private boolean containsFilenameToken(String text, String filename) {
        String base = filename;
        int dot = base.lastIndexOf('.');
        if (dot > 0) base = base.substring(0, dot);
        if (base.length() < 4) return false;
        return Pattern.compile(Pattern.quote(base.toLowerCase(Locale.ROOT))).matcher(text).find();
    }

    private List<String> readStringList(JsonNode node) {
        if (node == null || !node.isArray()) return List.of();
        List<String> result = new ArrayList<>();
        for (JsonNode item : node) if (item.isTextual() && !item.asText().isBlank()) result.add(item.asText());
        return result;
    }

    private int average(List<ScoreCategoryDto> categories) {
        return (int) Math.round(categories.stream().mapToInt(ScoreCategoryDto::score).average().orElse(75));
    }

    private int clampScore(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private List<String> defaultQuestions() {
        return List.of(
                "여러 업로드 파일 중 최소 3개를 근거로, 이 프로젝트에서 본인이 직접 수행한 핵심 역할을 설명해 주세요.",
                "첫 번째 파일에만 의존하지 말고 디자인 또는 기술 결정의 근거를 서로 다른 산출물로 연결해 설명해 주세요.",
                "결과나 임팩트를 증명하는 파일과 과정 증거를 보여주는 파일을 구분해 설명해 주세요.",
                "AI 생성물이 아니라 본인의 창작 과정임을 보여주는 증거를 두 개 이상의 파일에서 찾아 설명해 주세요.",
                "전체 파일 묶음을 봤을 때 심사위원이 의심할 수 있는 가장 큰 증거 공백은 무엇이며 어떻게 보완하겠습니까?"
        );
    }

    private Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!p.getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        return p;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    record PublicChatResult(String message, String conversationId, JsonNode metaData) {}
    record Evaluation(String feedback, List<EvidenceChipDto> evidence) {}
}
