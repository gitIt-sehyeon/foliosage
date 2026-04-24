package com.foliosage.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.portfolio.*;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.service.CertificateService;
import com.foliosage.service.VaultSageService;
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

    @GetMapping("/{shareCode}")
    public PortfolioResponse getPublicPortfolio(@PathVariable String shareCode) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.isPublished())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found");

        List<PortfolioResponse.PortfolioFileDto> files = fileRepository
                .findByPortfolioOrderByCreatedAtAsc(portfolio).stream()
                .map(f -> new PortfolioResponse.PortfolioFileDto(
                        f.getId(), f.getName(), f.getVaultsageFileId(),
                        f.getFileHash(), f.getMimeType(), f.getCertifiedAt()))
                .toList();

        return new PortfolioResponse(
                portfolio.getId(), portfolio.getTitle(), portfolio.getDescription(),
                portfolio.getOrganizerId(), portfolio.getShareCode(),
                portfolio.isPublished(), portfolio.getCreatedAt(), files);
    }

    @PostMapping("/{shareCode}/chat")
    public ChatResponse chat(@PathVariable String shareCode,
                             @Valid @RequestBody ChatRequest req) {
        portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        String raw = vaultSageService.publicChat(shareCode, req.message(), req.conversationId());
        try {
            JsonNode node = objectMapper.readTree(raw);
            String message = node.path("message").asText(
                    node.path("content").asText(node.path("response").asText("")));
            String convId = node.path("conversation_id").asText(
                    node.path("id").asText(""));
            return new ChatResponse(message, convId, "assistant");
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
        // verify this file belongs to this portfolio
        boolean owned = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio)
                .stream().anyMatch(f -> f.getVaultsageFileId().equals(vaultsageFileId));
        if (!owned) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");

        byte[] bytes = vaultSageService.downloadPngPreview(vaultsageFileId);
        if (bytes == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Preview not available");
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                .body(bytes);
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
}
