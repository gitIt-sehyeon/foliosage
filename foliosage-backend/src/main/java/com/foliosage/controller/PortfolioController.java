package com.foliosage.controller;

import com.foliosage.dto.portfolio.*;
import com.foliosage.service.OrganizeService;
import com.foliosage.service.PortfolioService;
import com.foliosage.service.VaultSageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/portfolios") @RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final OrganizeService organizeService;
    private final VaultSageService vaultSageService;

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

    @GetMapping("/preview/{vaultsageFileId}")
    public ResponseEntity<byte[]> preview(@PathVariable String vaultsageFileId) {
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
