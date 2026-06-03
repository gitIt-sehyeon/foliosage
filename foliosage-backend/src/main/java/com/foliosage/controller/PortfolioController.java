package com.foliosage.controller;

import com.foliosage.dto.portfolio.*;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.service.CertificateService;
import com.foliosage.service.DefenseService;
import com.foliosage.service.OrganizeService;
import com.foliosage.service.PortfolioService;
import com.foliosage.service.PortfolioStoryService;
import com.foliosage.service.PublishService;
import com.foliosage.service.SmartOrganizerService;
import com.foliosage.service.StatsService;
import com.foliosage.service.VaultSageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/portfolios") @RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final OrganizeService organizeService;
    private final VaultSageService vaultSageService;
    private final PortfolioFileRepository fileRepository;
    private final PublishService publishService;
    private final CertificateService certificateService;
    private final StatsService statsService;
    private final DefenseService defenseService;
    private final PortfolioStoryService portfolioStoryService;
    private final SmartOrganizerService smartOrganizerService;

    @PostMapping
    public PortfolioResponse create(@AuthenticationPrincipal UserDetails user,
                                    @Valid @RequestBody CreatePortfolioRequest req) {
        return portfolioService.create(user.getUsername(), req);
    }

    @GetMapping
    public List<PortfolioListItem> list(@AuthenticationPrincipal UserDetails user) {
        return portfolioService.list(user.getUsername());
    }

    @GetMapping("/{id}")
    public PortfolioResponse get(@AuthenticationPrincipal UserDetails user,
                                 @PathVariable UUID id) {
        return portfolioService.get(user.getUsername(), id);
    }

    @GetMapping("/{id}/story")
    public PortfolioStoryResponse getStory(@AuthenticationPrincipal UserDetails user,
                                           @PathVariable UUID id) {
        return portfolioStoryService.get(user.getUsername(), id);
    }

    @PostMapping("/{id}/story/generate")
    public PortfolioStoryResponse generateStory(@AuthenticationPrincipal UserDetails user,
                                                @PathVariable UUID id) {
        return portfolioStoryService.generate(user.getUsername(), id);
    }

    @PatchMapping("/{id}/story")
    public PortfolioStoryResponse updateStory(@AuthenticationPrincipal UserDetails user,
                                              @PathVariable UUID id,
                                              @RequestBody PortfolioStoryUpdateRequest req) {
        return portfolioStoryService.update(user.getUsername(), id, req);
    }

    @GetMapping("/{id}/readiness")
    public PortfolioReadinessResponse readiness(@AuthenticationPrincipal UserDetails user,
                                                @PathVariable UUID id) {
        return portfolioStoryService.readiness(user.getUsername(), id);
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        portfolioService.delete(user.getUsername(), id);
    }

    @PostMapping(value = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FileUploadResponse uploadFile(@AuthenticationPrincipal UserDetails user,
                                         @PathVariable UUID id,
                                         @RequestParam MultipartFile file) throws Exception {
        return portfolioService.uploadFile(user.getUsername(), id, file);
    }

    @PatchMapping("/{id}/files/{fileId}")
    public PortfolioResponse.PortfolioFileDto updateFile(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id,
            @PathVariable UUID fileId,
            @Valid @RequestBody FileUpdateRequest req) {
        return portfolioService.updateFileDescription(user.getUsername(), id, fileId, req.description());
    }

    @DeleteMapping("/{id}/files/{fileId}")
    public ResponseEntity<Void> deleteFile(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id,
            @PathVariable UUID fileId) {
        portfolioService.deleteFile(user.getUsername(), id, fileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/organize")
    public OrganizeStatusResponse startOrganize(@AuthenticationPrincipal UserDetails user,
                                                @PathVariable UUID id,
                                                @RequestParam(defaultValue = "false") boolean force) {
        organizeService.startAsync(user.getUsername(), id, force);
        return new OrganizeStatusResponse("started", "AI organization started");
    }

    @GetMapping("/{id}/organize/status")
    public OrganizeStatusResponse organizeStatus(@AuthenticationPrincipal UserDetails user,
                                                 @PathVariable UUID id) {
        return organizeService.getStatus(user.getUsername(), id);
    }

    @GetMapping("/{id}/organize/tree")
    public OrganizerTreeDto organizeTree(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id) {
        com.foliosage.entity.Portfolio portfolio = portfolioService.getPortfolioEntity(user.getUsername(), id);
        if (portfolio.getOrganizerId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio not organized yet");

        java.util.Map<String, OrganizerTreeDto.FileDto> filesByVaultsageId =
                fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio).stream()
                        .filter(f -> f.getVaultsageFileId() != null)
                        .collect(java.util.stream.Collectors.toMap(
                                com.foliosage.entity.PortfolioFile::getVaultsageFileId,
                                f -> new OrganizerTreeDto.FileDto(f.getVaultsageFileId(), f.getName(), f.getFileSize(), f.getCategory()),
                                (a, b) -> a));

        return vaultSageService.fetchOrganizerTree(portfolio.getOrganizerId(), filesByVaultsageId);
    }

    @PostMapping("/{id}/publish")
    public PublishResponse publish(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        return publishService.publish(user.getUsername(), id);
    }

    @PostMapping("/{id}/unpublish")
    public PublishResponse unpublish(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        return publishService.unpublish(user.getUsername(), id);
    }

    @GetMapping("/{id}/visitors")
    public ResponseEntity<String> visitors(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        String json = publishService.getVisitorLogs(user.getUsername(), id);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(json);
    }

    @GetMapping("/{id}/stats")
    public StatsResponse stats(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        portfolioService.getPortfolioEntity(user.getUsername(), id);
        return statsService.getStats(id);
    }

    @GetMapping("/{id}/certificates/{fileId}/download")
    public ResponseEntity<byte[]> downloadCertificate(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id,
            @PathVariable UUID fileId) {
        try {
            byte[] pdf = certificateService.generateForFile(user.getUsername(), id, fileId);
            String filename = "certificate-" + fileId + ".pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .body(pdf);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate certificate");
        }
    }

    @PostMapping("/{id}/defense/sessions")
    public DefenseDtos.DefenseSessionResponse startDefense(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id) {
        return defenseService.start(user.getUsername(), id);
    }

    @GetMapping("/{id}/defense/sessions/latest")
    public DefenseDtos.DefenseSessionResponse latestDefense(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id) {
        return defenseService.latest(user.getUsername(), id);
    }

    @PostMapping("/{id}/defense/sessions/{sessionId}/answers")
    public DefenseDtos.DefenseSessionResponse answerDefense(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id,
            @PathVariable UUID sessionId,
            @Valid @RequestBody DefenseAnswerRequest req) {
        return defenseService.answer(user.getUsername(), id, sessionId, req.answer());
    }

    @GetMapping("/{id}/organize/result")
    public OrganizerResultDto getOrganizeResult(@AuthenticationPrincipal UserDetails user,
                                                 @PathVariable UUID id) {
        return smartOrganizerService.getResult(user.getUsername(), id);
    }

    @PatchMapping("/{id}/files/{fileId}/category")
    public OrganizerResultDto.FileClassificationDto updateFileCategory(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id,
            @PathVariable UUID fileId,
            @RequestBody FileCategoryUpdateRequest req) {
        return smartOrganizerService.updateCategory(user.getUsername(), id, fileId, req.category());
    }

    @PostMapping("/{id}/organize/confirm")
    public OrganizerResultDto confirmOrganize(@AuthenticationPrincipal UserDetails user,
                                               @PathVariable UUID id) {
        return smartOrganizerService.confirm(user.getUsername(), id);
    }

    @GetMapping("/preview/{vaultsageFileId}")
    public ResponseEntity<byte[]> preview(@AuthenticationPrincipal UserDetails user,
                                          @PathVariable String vaultsageFileId) {
        fileRepository.findByVaultsageFileId(vaultsageFileId)
                .filter(f -> f.getPortfolio().getUser().getEmail().equals(user.getUsername()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        try {
            byte[] bytes = vaultSageService.downloadPngPreview(vaultsageFileId);
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                    .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
