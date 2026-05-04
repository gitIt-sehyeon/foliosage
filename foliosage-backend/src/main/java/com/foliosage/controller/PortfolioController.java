package com.foliosage.controller;

import com.foliosage.dto.portfolio.*;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.service.CertificateService;
import com.foliosage.service.OrganizeService;
import com.foliosage.service.PortfolioService;
import com.foliosage.service.PublishService;
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
                                                @PathVariable UUID id) {
        organizeService.startAsync(user.getUsername(), id);
        return new OrganizeStatusResponse("started", "AI organization started");
    }

    @GetMapping("/{id}/organize/status")
    public OrganizeStatusResponse organizeStatus(@AuthenticationPrincipal UserDetails user,
                                                 @PathVariable UUID id) {
        return organizeService.getStatus(user.getUsername(), id);
    }

    @GetMapping("/{id}/organize/tree")
    public com.foliosage.dto.portfolio.OrganizerTreeDto organizeTree(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id) {
        com.foliosage.entity.Portfolio portfolio = portfolioService.getPortfolioEntity(user.getUsername(), id);
        if (portfolio.getOrganizerId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio not organized yet");
        return vaultSageService.fetchOrganizerTree(portfolio.getOrganizerId());
    }

    @PostMapping("/{id}/publish")
    public PublishResponse publish(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        return publishService.publish(user.getUsername(), id);
    }

    @GetMapping("/{id}/visitors")
    public ResponseEntity<String> visitors(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        String json = publishService.getVisitorLogs(user.getUsername(), id);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(json);
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
