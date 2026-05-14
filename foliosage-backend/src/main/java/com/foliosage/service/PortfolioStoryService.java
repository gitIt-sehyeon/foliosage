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
                    : "";
            draft = parseDraft(raw, files).orElseGet(() -> fallbackDraft(portfolio, files));
            story.setStatus("ready");
            story.setErrorMessage(null);
        } catch (Exception e) {
            draft = fallbackDraft(portfolio, files);
            story.setStatus("ready");
            story.setErrorMessage("AI returned an incomplete response, so FolioSage created a draft from portfolio metadata.");
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
        String nextAction = !evidenceReady ? "Upload project files"
                : !storyReady ? "Generate Portfolio Story"
                : !aiReviewReady ? "Run AI Portfolio Review"
                : !publicLinkReady ? "Publish portfolio"
                : "Ready to share";
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
                You are helping a job seeker turn project files into an interview-ready evidence portfolio.
                Return JSON only using this exact shape:
                {"summary":"...","role":"...","problem":"...","solution":"...","impact":"...","evidenceHighlights":[{"fileId":"database uuid","vaultsageFileId":"VaultSage id","fileName":"exact file name","reason":"..."}],"missingProof":["..."],"interviewQuestions":["..."]}.
                Write concise, specific portfolio copy in first person where useful. Evidence highlights must cite real files from the manifest.
                Portfolio title: %s
                Portfolio description: %s
                File manifest:
                %s
                """.formatted(portfolio.getTitle(), nullToEmpty(portfolio.getDescription()), fileManifest(files));
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
                        hasText(file.getDescription()) ? file.getDescription() : "Supports the project story with original source evidence."))
                .toList();
        String title = portfolio.getTitle() != null ? portfolio.getTitle() : "this project";
        return new StoryDraft(
                hasText(portfolio.getDescription()) ? portfolio.getDescription() : "A focused portfolio story for " + title + ".",
                "I contributed the planning, execution, and evidence collection shown in the uploaded files.",
                "The project needed a clear explanation of the work, the decisions behind it, and proof that can stand up in an interview.",
                "I organized the available artifacts into a portfolio narrative and connected each claim to supporting evidence.",
                "The portfolio now gives reviewers a faster way to understand the project, inspect source files, and ask evidence-based questions.",
                highlights,
                files.isEmpty() ? List.of("Upload source files, process artifacts, or measurable results.") : List.of("Add metrics, before/after comparisons, or process notes where available."),
                List.of(
                        "What was your specific role in this project?",
                        "Which file best proves your strongest contribution, and why?",
                        "What tradeoff did you make during the project?",
                        "What measurable impact or outcome can you point to?",
                        "What proof would you add next to make this portfolio stronger?"
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
                        item.path("reason").asText("Supports this portfolio story.")
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
