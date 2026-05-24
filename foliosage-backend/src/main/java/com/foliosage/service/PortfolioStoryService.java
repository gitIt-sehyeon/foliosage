package com.foliosage.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.portfolio.PortfolioReadinessResponse;
import com.foliosage.dto.portfolio.PortfolioStoryResponse;
import com.foliosage.dto.portfolio.PortfolioStoryUpdateRequest;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioDefenseSession;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.entity.PortfolioStory;
import com.foliosage.repository.PortfolioDefenseSessionRepository;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.PortfolioStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PortfolioStoryService {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final PortfolioStoryRepository storyRepository;
    private final PortfolioDefenseSessionRepository defenseSessionRepository;
    private final VaultSageService vaultSageService;

    @Transactional(readOnly = true)
    public PortfolioStoryResponse get(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        return storyRepository.findByPortfolio(portfolio).map(this::toResponse).orElse(null);
    }

    @Transactional
    public PortfolioStoryResponse generate(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);

        PortfolioStory story = storyRepository.findByPortfolio(portfolio)
                .orElseGet(() -> PortfolioStory.builder()
                        .portfolio(portfolio)
                        .status("generating")
                        .evidenceHighlightsJson("[]")
                        .missingProofJson("[]")
                        .interviewQuestionsJson("[]")
                        .build());
        story.setStatus("generating");
        story.setErrorMessage(null);
        storyRepository.save(story);

        StoryDraft draft;
        try {
            String raw = portfolio.isPublished() && portfolio.getShareCode() != null && !portfolio.getShareCode().isBlank()
                    ? callPublishedStoryGeneration(portfolio, files)
                    : callPrivateStoryGeneration(portfolio, files);
            draft = parseDraft(raw, files).orElseGet(() -> fallbackDraft(portfolio, files));
            story.setStatus("ready");
            story.setErrorMessage(null);
        } catch (Exception e) {
            draft = fallbackDraft(portfolio, files);
            story.setStatus("ready");
            story.setErrorMessage("AI 응답이 완전하지 않아 FolioSage가 포트폴리오 정보를 바탕으로 초안을 만들었습니다.");
        }

        applyDraft(story, draft);
        story.setGeneratedAt(OffsetDateTime.now());
        return toResponse(storyRepository.save(story));
    }

    @Transactional
    public PortfolioStoryResponse update(String userEmail, UUID portfolioId, PortfolioStoryUpdateRequest req) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        PortfolioStory story = storyRepository.findByPortfolio(portfolio)
                .orElseGet(() -> PortfolioStory.builder()
                        .portfolio(portfolio)
                        .status("ready")
                        .generatedAt(OffsetDateTime.now())
                        .build());

        story.setSummary(req.summary());
        story.setRole(req.role());
        story.setProblem(req.problem());
        story.setSolution(req.solution());
        story.setImpact(req.impact());
        story.setEvidenceHighlightsJson(writeJson(req.evidenceHighlights() != null ? req.evidenceHighlights() : List.of()));
        story.setMissingProofJson(writeJson(req.missingProof() != null ? req.missingProof() : List.of()));
        story.setInterviewQuestionsJson(writeJson(req.interviewQuestions() != null ? req.interviewQuestions() : List.of()));
        story.setStatus("ready");
        story.setErrorMessage(null);
        return toResponse(storyRepository.save(story));
    }

    @Transactional(readOnly = true)
    public PortfolioReadinessResponse readiness(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        return readiness(portfolio);
    }

    @Transactional(readOnly = true)
    public PortfolioReadinessResponse readiness(Portfolio portfolio) {
        long fileCount = fileRepository.countByPortfolio(portfolio);
        boolean storyReady = storyRepository.findByPortfolio(portfolio)
                .map(story -> "ready".equals(story.getStatus()) && hasText(story.getSummary()))
                .orElse(false);
        boolean evidenceReady = fileCount > 0;
        boolean aiReviewReady = defenseSessionRepository
                .findFirstByPortfolioAndStatusOrderByCompletedAtDesc(portfolio, "completed")
                .isPresent();
        boolean publicLinkReady = portfolio.isPublished();
        int score = 0;
        if (storyReady) score += 30;
        if (evidenceReady) score += 25;
        if (aiReviewReady) score += 20;
        if (publicLinkReady) score += 25;
        String nextAction = !evidenceReady ? "프로젝트 파일 업로드"
                : !storyReady ? "포트폴리오 스토리 생성"
                : !aiReviewReady ? "AI 포트폴리오 리뷰 실행"
                : !publicLinkReady ? "포트폴리오 공개"
                : "공유 준비 완료";
        return new PortfolioReadinessResponse(score, storyReady, evidenceReady, aiReviewReady, publicLinkReady, nextAction);
    }

    public PortfolioStoryResponse toResponse(PortfolioStory story) {
        return new PortfolioStoryResponse(
                story.getId(),
                story.getSummary(),
                story.getRole(),
                story.getProblem(),
                story.getSolution(),
                story.getImpact(),
                readEvidenceHighlights(story.getEvidenceHighlightsJson()),
                readStringList(story.getMissingProofJson()),
                readStringList(story.getInterviewQuestionsJson()),
                story.getStatus(),
                story.getErrorMessage(),
                story.getGeneratedAt(),
                story.getUpdatedAt()
        );
    }

    String buildPrompt(Portfolio portfolio, List<PortfolioFile> files) {
        return """
                %s
                당신은 취업 준비자가 프로젝트 파일을 면접에서 설명 가능한 근거 기반 포트폴리오로 정리하도록 돕는 AI입니다.
                아래 JSON 형태만 반환하세요:
                {"summary":"...","role":"...","problem":"...","solution":"...","impact":"...","evidenceHighlights":[{"fileId":"database uuid","vaultsageFileId":"VaultSage id","fileName":"exact file name","reason":"..."}],"missingProof":["..."],"interviewQuestions":["..."]}.
                각 JSON 값은 간결하고 구체적인 한국어 문장으로 작성하고, 필요하면 1인칭을 사용하세요.
                evidenceHighlights는 반드시 아래 파일 목록에 실제로 있는 파일만 인용해야 합니다.
                포트폴리오 제목: %s
                포트폴리오 설명: %s
                파일 목록:
                %s
                """.formatted(
                AiLanguageInstructions.KOREAN_ONLY,
                portfolio.getTitle(),
                nullToEmpty(portfolio.getDescription()),
                fileManifest(files));
    }

    Optional<StoryDraft> parseDraft(String raw, List<PortfolioFile> files) {
        JsonNode node = parseJsonPayload(raw);
        if (node == null || !node.isObject()) return Optional.empty();
        String summary = text(node, "summary");
        if (!hasText(summary)) return Optional.empty();
        return Optional.of(new StoryDraft(
                summary,
                text(node, "role"),
                text(node, "problem"),
                text(node, "solution"),
                text(node, "impact"),
                parseEvidence(node.path("evidenceHighlights").isMissingNode() ? node.path("evidence_highlights") : node.path("evidenceHighlights"), files),
                readStringList(node.path("missingProof").isMissingNode() ? node.path("missing_proof") : node.path("missingProof")),
                readStringList(node.path("interviewQuestions").isMissingNode() ? node.path("interview_questions") : node.path("interviewQuestions"))
        ));
    }

    private String callPrivateStoryGeneration(Portfolio portfolio, List<PortfolioFile> files) {
        List<String> fileIds = files.stream()
                .map(PortfolioFile::getVaultsageFileId)
                .filter(id -> id != null && !id.isBlank())
                .toList();
        return vaultSageService.privateChat(buildPrompt(portfolio, files), fileIds);
    }

    private String callPublishedStoryGeneration(Portfolio portfolio, List<PortfolioFile> files) {
        String raw = vaultSageService.publicChat(
                normalizeShareCode(portfolio.getShareCode()),
                buildPrompt(portfolio, files),
                null,
                UUID.randomUUID().toString());
        try {
            JsonNode node = MAPPER.readTree(raw);
            return node.path("message").asText(node.path("content").asText(node.path("response").asText(raw)));
        } catch (Exception e) {
            return raw;
        }
    }

    private StoryDraft fallbackDraft(Portfolio portfolio, List<PortfolioFile> files) {
        List<PortfolioStoryResponse.EvidenceHighlightDto> highlights = files.stream()
                .limit(4)
                .map(file -> new PortfolioStoryResponse.EvidenceHighlightDto(
                        file.getId(), file.getVaultsageFileId(), file.getName(),
                        hasText(file.getDescription()) ? file.getDescription() : "프로젝트 설명을 뒷받침하는 원본 근거 파일입니다."))
                .toList();
        String title = portfolio.getTitle() != null ? portfolio.getTitle() : "이 프로젝트";
        return new StoryDraft(
                hasText(portfolio.getDescription()) ? portfolio.getDescription() : title + "를 설명하기 위한 포트폴리오 초안입니다.",
                "업로드된 파일에 드러난 기획, 실행, 근거 정리를 담당했습니다.",
                "이 프로젝트는 작업 내용과 의사결정 이유를 명확히 설명하고, 면접에서 확인 가능한 근거로 뒷받침할 필요가 있었습니다.",
                "사용 가능한 산출물을 포트폴리오 흐름으로 정리하고 각 주장에 연결되는 근거 파일을 연결했습니다.",
                "리뷰어가 프로젝트를 빠르게 이해하고 원본 파일을 확인하며 근거 기반 질문을 할 수 있게 되었습니다.",
                highlights,
                files.isEmpty() ? List.of("원본 파일, 작업 과정 산출물, 측정 가능한 결과 자료를 업로드하세요.") : List.of("가능하다면 지표, 전후 비교, 작업 과정 메모를 추가하세요."),
                List.of(
                        "이 프로젝트에서 본인이 직접 맡은 역할은 무엇이었나요?",
                        "가장 강한 기여를 증명하는 파일은 무엇이며, 왜 그렇게 볼 수 있나요?",
                        "프로젝트 진행 중 어떤 trade-off를 선택했나요?",
                        "측정 가능한 성과나 결과로 제시할 수 있는 것은 무엇인가요?",
                        "이 포트폴리오의 설득력을 높이기 위해 다음으로 어떤 근거를 추가하겠습니까?"
                )
        );
    }

    private void applyDraft(PortfolioStory story, StoryDraft draft) {
        story.setSummary(draft.summary());
        story.setRole(draft.role());
        story.setProblem(draft.problem());
        story.setSolution(draft.solution());
        story.setImpact(draft.impact());
        story.setEvidenceHighlightsJson(writeJson(draft.evidenceHighlights()));
        story.setMissingProofJson(writeJson(draft.missingProof()));
        story.setInterviewQuestionsJson(writeJson(draft.interviewQuestions()));
    }

    private List<PortfolioStoryResponse.EvidenceHighlightDto> parseEvidence(JsonNode node, List<PortfolioFile> files) {
        if (node == null || !node.isArray()) return List.of();
        List<PortfolioStoryResponse.EvidenceHighlightDto> result = new ArrayList<>();
        for (JsonNode item : node) {
            String vaultsageFileId = item.path("vaultsageFileId").asText(item.path("vaultsage_file_id").asText(""));
            String fileName = item.path("fileName").asText(item.path("file_name").asText(item.path("name").asText("")));
            PortfolioFile matched = files.stream()
                    .filter(file -> (!vaultsageFileId.isBlank() && vaultsageFileId.equals(file.getVaultsageFileId()))
                            || (!fileName.isBlank() && fileName.equalsIgnoreCase(file.getName())))
                    .findFirst()
                    .orElse(null);
            if (matched != null) {
                result.add(new PortfolioStoryResponse.EvidenceHighlightDto(
                        matched.getId(),
                        matched.getVaultsageFileId(),
                        matched.getName(),
                        item.path("reason").asText("이 포트폴리오 설명을 뒷받침하는 근거입니다.")
                ));
            }
        }
        return result.size() > 6 ? result.subList(0, 6) : result;
    }

    private List<PortfolioStoryResponse.EvidenceHighlightDto> readEvidenceHighlights(String json) {
        if (!hasText(json)) return List.of();
        try {
            return MAPPER.readerForListOf(PortfolioStoryResponse.EvidenceHighlightDto.class).readValue(json);
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<String> readStringList(String json) {
        if (!hasText(json)) return List.of();
        try {
            JsonNode node = MAPPER.readTree(json);
            return readStringList(node);
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<String> readStringList(JsonNode node) {
        if (node == null || !node.isArray()) return List.of();
        List<String> result = new ArrayList<>();
        for (JsonNode item : node) {
            String value = item.isTextual() ? item.asText() : item.path("question").asText(item.path("text").asText(""));
            if (hasText(value)) result.add(value.trim());
        }
        return result;
    }

    private JsonNode parseJsonPayload(String raw) {
        if (!hasText(raw)) return null;
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }
        int objectStart = trimmed.indexOf('{');
        if (objectStart > 0) trimmed = trimmed.substring(objectStart);
        try {
            return MAPPER.readTree(trimmed);
        } catch (Exception e) {
            return null;
        }
    }

    private String fileManifest(List<PortfolioFile> files) {
        StringBuilder sb = new StringBuilder();
        for (PortfolioFile file : files) {
            sb.append("- fileId=").append(file.getId())
                    .append(" | vaultsageFileId=").append(file.getVaultsageFileId())
                    .append(" | fileName=").append(file.getName())
                    .append(" | mimeType=").append(nullToEmpty(file.getMimeType()))
                    .append(" | description=").append(nullToEmpty(file.getDescription()))
                    .append("\n");
        }
        return sb.toString();
    }

    private String writeJson(Object value) {
        try {
            return MAPPER.writeValueAsString(value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize portfolio story", e);
        }
    }

    private Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!p.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return p;
    }

    private static String normalizeShareCode(String shareCode) {
        if (shareCode == null) return null;
        int idx = shareCode.indexOf("code=");
        return idx >= 0 ? shareCode.substring(idx + 5) : shareCode;
    }

    private String text(JsonNode node, String field) {
        return node.path(field).asText("");
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    record StoryDraft(
            String summary,
            String role,
            String problem,
            String solution,
            String impact,
            List<PortfolioStoryResponse.EvidenceHighlightDto> evidenceHighlights,
            List<String> missingProof,
            List<String> interviewQuestions
    ) {}
}
