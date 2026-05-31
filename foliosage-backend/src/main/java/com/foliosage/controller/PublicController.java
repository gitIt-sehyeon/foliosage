package com.foliosage.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.portfolio.*;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.dto.user.PublicUserResponse;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.PortfolioDefenseSessionRepository;
import com.foliosage.repository.PortfolioStoryRepository;
import com.foliosage.repository.UserRepository;
import com.foliosage.service.CertificateService;
import com.foliosage.service.DefenseService;
import com.foliosage.service.StatsService;
import com.foliosage.service.PortfolioStoryService;
import com.foliosage.service.VaultSageService;
import com.foliosage.service.AiLanguageInstructions;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final VaultSageService vaultSageService;
    private final CertificateService certificateService;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final DefenseService defenseService;
    private final StatsService statsService;
    private final PortfolioDefenseSessionRepository defenseSessionRepository;
    private final PortfolioStoryRepository storyRepository;
    private final PortfolioStoryService portfolioStoryService;

    @GetMapping("/{shareCode}")
    public PortfolioResponse getPublicPortfolio(@PathVariable String shareCode) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.isPublished())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found");

        statsService.incrementViewCount(portfolio.getId());

        List<PortfolioResponse.PortfolioFileDto> files = fileRepository
                .findByPortfolioOrderByCreatedAtAsc(portfolio).stream()
                .map(f -> new PortfolioResponse.PortfolioFileDto(
                        f.getId(), f.getName(), f.getVaultsageFileId(),
                        f.getFileHash(), f.getMimeType(), f.getCertifiedAt(),
                        f.getDescription(), f.getCategory(), f.getCategoryConfidence(),
                        f.getCategoryReasoning(), f.getCategoryLocked()))
                .toList();

        return new PortfolioResponse(
                portfolio.getId(), portfolio.getTitle(), portfolio.getDescription(),
                portfolio.getOrganizerId(), portfolio.getShareCode(),
                portfolio.isPublished(), portfolio.getCreatedAt(),
                portfolio.getUser().getName(), portfolio.getViewCount(), files,
                storyRepository.findByPortfolio(portfolio).map(portfolioStoryService::toResponse).orElse(null));
    }

    @PostMapping("/{shareCode}/chat")
    public ChatResponse chat(@PathVariable String shareCode,
                             @Valid @RequestBody ChatRequest req) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);

        String raw = vaultSageService.publicChat(shareCode, koreanChatMessage(req.message()), req.conversationId(), req.sessionId());
        try {
            JsonNode node = objectMapper.readTree(raw);
            String message = node.path("message").asText(
                    node.path("content").asText(node.path("response").asText("")));
            String convId = node.path("conversation_id").asText(
                    node.path("id").asText(""));
            JsonNode metaData = node.path("meta_data").isMissingNode() ? null : node.path("meta_data");
            return new ChatResponse(message, convId, "assistant",
                    defenseService.extractChatEvidence(message, metaData, files));
        } catch (Exception e) {
            return new ChatResponse(raw, null, "assistant");
        }
    }

    @GetMapping("/{shareCode}/preview/{vaultsageFileId}")
    public ResponseEntity<byte[]> preview(@PathVariable String shareCode,
                                          @PathVariable String vaultsageFileId) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        PortfolioFile file = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio)
                .stream()
                .filter(f -> f.getVaultsageFileId().equals(vaultsageFileId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        byte[] bytes = vaultSageService.streamPreviewAnonymous(shareCode, vaultsageFileId);
        if (bytes == null || bytes.length == 0)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Preview not available");

        String mimeType = file.getMimeType() != null ? file.getMimeType() : "application/octet-stream";
        org.springframework.http.MediaType mediaType;
        try {
            mediaType = org.springframework.http.MediaType.parseMediaType(mimeType);
        } catch (Exception e) {
            mediaType = org.springframework.http.MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok().contentType(mediaType).body(bytes);
    }

    @GetMapping("/{shareCode}/certificates/{fileId}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String shareCode,
                                                       @PathVariable UUID fileId) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        PortfolioFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getPortfolio().getId().equals(portfolio.getId()))
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        try {
            byte[] pdf = certificateService.buildPdf(
                    file.getName(), file.getFileHash(), file.getVaultsageFileId(),
                    file.getCertifiedAt() != null
                            ? file.getCertifiedAt().withOffsetSameInstant(java.time.ZoneOffset.UTC).toLocalDateTime()
                            : java.time.LocalDateTime.now(java.time.ZoneOffset.UTC),
                    file.getPortfolio().getUser().getName()
            );
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header("Content-Disposition", "attachment; filename=\"certificate-" + fileId + ".pdf\"")
                    .body(pdf);
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate certificate"); }
    }

    @GetMapping("/{shareCode}/chat/history")
    public ResponseEntity<String> chatHistory(@PathVariable String shareCode) {
        portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(vaultSageService.getPublicChatHistory(shareCode));
    }

    @GetMapping("/{shareCode}/defense")
    public DefenseDtos.PublicDefenseResponse publicDefense(@PathVariable String shareCode) {
        return defenseService.publicDefense(shareCode);
    }

    @GetMapping("/{shareCode}/files/{vaultsageFileId}/raw")
    public ResponseEntity<byte[]> rawFile(
            @PathVariable String shareCode,
            @PathVariable String vaultsageFileId,
            @RequestParam(defaultValue = "false") boolean download) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        PortfolioFile file = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio)
                .stream()
                .filter(f -> f.getVaultsageFileId().equals(vaultsageFileId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        byte[] bytes = vaultSageService.downloadFile(vaultsageFileId);
        if (bytes == null || bytes.length == 0)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not available");

        statsService.incrementDownloadCount(portfolio.getId());

        String mimeType = resolveMimeType(file, bytes);
        String disposition = download
                ? org.springframework.http.ContentDisposition.attachment()
                        .filename(file.getName(), java.nio.charset.StandardCharsets.UTF_8)
                        .build().toString()
                : org.springframework.http.ContentDisposition.inline()
                        .filename(file.getName(), java.nio.charset.StandardCharsets.UTF_8)
                        .build().toString();

        org.springframework.http.MediaType mediaType;
        try {
            mediaType = org.springframework.http.MediaType.parseMediaType(mimeType);
        } catch (Exception e) {
            mediaType = org.springframework.http.MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header("Content-Disposition", disposition)
                .header("X-Content-Type-Options", "nosniff")
                .body(bytes);
    }

    private String resolveMimeType(PortfolioFile file, byte[] bytes) {
        if (looksLikePdf(bytes)) return "application/pdf";
        String name = file.getName() != null ? file.getName().toLowerCase(java.util.Locale.ROOT) : "";
        if (name.endsWith(".pdf")) return "application/pdf";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".gif")) return "image/gif";
        return file.getMimeType() != null ? file.getMimeType() : "application/octet-stream";
    }

    private boolean looksLikePdf(byte[] bytes) {
        return bytes != null
                && bytes.length >= 5
                && bytes[0] == '%'
                && bytes[1] == 'P'
                && bytes[2] == 'D'
                && bytes[3] == 'F'
                && bytes[4] == '-';
    }

    private String koreanChatMessage(String userMessage) {
        return """
                %s
                Answer only from the portfolio files and story evidence. If the evidence is unclear or missing,
                say that plainly instead of guessing. Keep the answer concise, structured, and easy to scan.

                [Visitor question]
                %s
                """.formatted(AiLanguageInstructions.ENGLISH_ONLY, userMessage == null ? "" : userMessage);
    }

    @GetMapping("/users/{username}")
    public PublicUserResponse getPublicUser(@PathVariable String username) {
        com.foliosage.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<com.foliosage.entity.Portfolio> portfolios = portfolioRepository.findByUserAndPublishedTrue(user);

        int totalViews = portfolios.stream().mapToInt(com.foliosage.entity.Portfolio::getViewCount).sum();

        List<PublicUserResponse.PortfolioSummary> summaries = portfolios.stream()
                .map(p -> {
                    DefenseSummary defense = latestDefenseSummary(p);
                    return new PublicUserResponse.PortfolioSummary(
                            p.getId(), p.getTitle(), p.getDescription(),
                            p.getShareCode(), p.getViewCount(),
                            (int) fileRepository.countByPortfolio(p),
                            defense.completed(), defense.overallScore(), defense.summary());
                })
                .toList();

        return new PublicUserResponse(
                user.getUsername(), user.getName(), user.getBio(),
                user.getLocation(), user.getLinkedinUrl(), user.getGithubUrl(),
                totalViews, summaries);
    }

    private DefenseSummary latestDefenseSummary(Portfolio portfolio) {
        return defenseSessionRepository.findFirstByPortfolioAndStatusOrderByCompletedAtDesc(portfolio, "completed")
                .map(session -> {
                    try {
                        JsonNode node = objectMapper.readTree(session.getScorecardJson());
                        return new DefenseSummary(
                                true,
                                node.path("overallScore").isNumber() ? node.path("overallScore").asInt() : null,
                                node.path("summary").asText(null));
                    } catch (Exception e) {
                        return new DefenseSummary(true, null, null);
                    }
                })
                .orElse(new DefenseSummary(false, null, null));
    }

    private record DefenseSummary(boolean completed, Integer overallScore, String summary) {}
}
