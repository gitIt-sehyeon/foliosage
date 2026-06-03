package com.foliosage.service;

import com.foliosage.dto.portfolio.OrganizeStatusResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service @Slf4j @RequiredArgsConstructor
public class OrganizeService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final VaultSageService vaultSageService;
    private final SmartOrganizerService smartOrganizerService;

    @Setter
    @Lazy @Autowired
    private OrganizeService self;

    private final Map<UUID, String> statusCache = new ConcurrentHashMap<>();

    public void startAsync(String userEmail, UUID portfolioId) {
        startAsync(userEmail, portfolioId, false);
    }

    public void startAsync(String userEmail, UUID portfolioId, boolean force) {
        getPortfolioForUser(userEmail, portfolioId);
        persistStatus(portfolioId, "generating");
        self.runPipeline(portfolioId, force);
    }

    @Async
    public void runPipeline(UUID portfolioId) {
        runPipeline(portfolioId, false);
    }

    @Async
    public void runPipeline(UUID portfolioId, boolean force) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow();
        String orgId = resolveOrganizerId(portfolio);
        try {
            List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);
            List<String> fileIds = files.stream()
                    .map(PortfolioFile::getVaultsageFileId)
                    .filter(java.util.Objects::nonNull)
                    .toList();

            persistStatus(portfolioId, "generating");

            if (!fileIds.isEmpty()) {
                vaultSageService.updateOrganizerScope(orgId, portfolio.getDirectoryId());
                waitForFilesReady(fileIds, portfolioId);
            }

            String generateJobId = vaultSageService.generateTree(orgId);
            pollUntilDone(() -> vaultSageService.getGenerateStatus(orgId, generateJobId), "generating", portfolioId);

            persistStatus(portfolioId, "applying");
            String applyJobId = vaultSageService.applyOrganizer(orgId);
            pollUntilDone(() -> vaultSageService.getApplyProgress(orgId, applyJobId), "applying", portfolioId);

            persistStatus(portfolioId, "materializing");
            String materializeJobId = vaultSageService.materialize(orgId);
            pollUntilDone(() -> vaultSageService.getMaterializeStatus(orgId, materializeJobId), "materializing", portfolioId);

            // Mirror the resulting structure into our local 4-category view used by /organize/result.
            smartOrganizerService.classify(portfolioId, force);
            persistStatus(portfolioId, "done");
            log.info("Organize pipeline completed for portfolio={}", portfolioId);
        } catch (Exception e) {
            log.error("Organize pipeline failed at status={} for portfolio={}", statusCache.get(portfolioId), portfolioId, e);
            persistStatus(portfolioId, "failed");
        }
    }

    /**
     * Portfolios created before an organizer was provisioned (legacy data, or a failed
     * creation call) have no organizerId. Create one on the fly so the VaultSage pipeline
     * can still run, and persist it so subsequent runs reuse the same organizer.
     */
    private String resolveOrganizerId(Portfolio portfolio) {
        String orgId = portfolio.getOrganizerId();
        if (orgId != null && !orgId.isBlank()) return orgId;

        log.info("Portfolio={} has no organizer; creating one on the fly", portfolio.getId());
        orgId = vaultSageService.createOrganizer(portfolio.getTitle(), portfolio.getDirectoryId());
        self.attachOrganizer(portfolio.getId(), orgId);
        portfolio.setOrganizerId(orgId);
        return orgId;
    }

    @Transactional
    public void attachOrganizer(UUID portfolioId, String organizerId) {
        portfolioRepository.findById(portfolioId).ifPresent(p -> {
            p.setOrganizerId(organizerId);
            portfolioRepository.save(p);
        });
    }

    public OrganizeStatusResponse getStatus(String userEmail, UUID portfolioId) {
        getPortfolioForUser(userEmail, portfolioId);
        // Prefer in-memory cache; fall back to DB (survives server restart)
        String status = statusCache.computeIfAbsent(portfolioId, id ->
                portfolioRepository.findById(id)
                        .map(p -> p.getOrganizeStatus() != null ? p.getOrganizeStatus() : "idle")
                        .orElse("idle"));
        String message = switch (status) {
            case "generating"    -> "AI is analyzing your files...";
            case "applying"      -> "Applying project structure...";
            case "materializing" -> "Finalizing organization...";
            case "done"          -> "Organization complete!";
            case "failed"        -> "Organization failed. Please retry.";
            default              -> "Not started";
        };
        return new OrganizeStatusResponse(status, message);
    }

    private void persistStatus(UUID portfolioId, String status) {
        statusCache.put(portfolioId, status);
        self.persistStatusToDb(portfolioId, status);
        if ("done".equals(status) || "failed".equals(status)) {
            statusCache.remove(portfolioId);
        }
    }

    @Transactional
    public void persistStatusToDb(UUID portfolioId, String status) {
        portfolioRepository.findById(portfolioId).ifPresent(p -> {
            p.setOrganizeStatus(status);
            if ("done".equals(status)) p.setOrganizeCompletedAt(OffsetDateTime.now());
            portfolioRepository.save(p);
        });
    }

    private static final java.util.Set<String> FILE_READY_STATUSES =
            java.util.Set.of("completed", "success", "skipped", "failed");

    private void waitForFilesReady(List<String> fileIds, UUID portfolioId) throws InterruptedException {
        int maxAttempts = 100; // ~5 minutes at 3s interval
        for (int i = 0; i < maxAttempts; i++) {
            boolean allReady = fileIds.stream().allMatch(id -> {
                try {
                    String s = vaultSageService.getProcessingStatus(id);
                    return FILE_READY_STATUSES.contains(s == null ? "" : s.toLowerCase());
                } catch (Exception e) {
                    log.warn("Could not check processing status for fileId={}", id, e);
                    return false;
                }
            });
            if (allReady) return;
            if (i % 5 == 0) log.info("Waiting for files to be ready, attempt={}/{}, portfolio={}", i, maxAttempts, portfolioId);
            Thread.sleep(3000);
        }
        throw new RuntimeException("Files did not finish processing within timeout for portfolio=" + portfolioId);
    }

    // VaultSage reports finished jobs as "succeeded" (and a few synonyms); failures as
    // "failed"/"error"/"cancelled". Match defensively so a vocabulary difference can't
    // strand the pipeline until the 10-minute timeout.
    private static final java.util.Set<String> SUCCESS_STATUSES =
            java.util.Set.of("done", "completed", "complete", "success", "succeeded", "finished");
    private static final java.util.Set<String> FAILURE_STATUSES =
            java.util.Set.of("failed", "error", "errored", "cancelled", "canceled");

    private void pollUntilDone(java.util.function.Supplier<String> statusFn,
                               String currentStep, UUID portfolioId) throws InterruptedException {
        int maxAttempts = 200;
        for (int i = 0; i < maxAttempts; i++) {
            String s = statusFn.get();
            if (i % 10 == 0) log.debug("Polling step={} attempt={} status={} portfolio={}", currentStep, i, s, portfolioId);
            if (s == null) { Thread.sleep(3000); continue; }
            String norm = s.toLowerCase();
            if (SUCCESS_STATUSES.contains(norm)) return;
            if (FAILURE_STATUSES.contains(norm))
                throw new RuntimeException("Step " + currentStep + " failed with status: " + s);
            Thread.sleep(3000);
        }
        throw new RuntimeException("Timed out waiting for " + currentStep);
    }

    private Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!p.getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        return p;
    }
}
