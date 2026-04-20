package com.foliosage.service;

import com.foliosage.dto.portfolio.OrganizeStatusResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service @Slf4j @RequiredArgsConstructor
public class OrganizeService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final VaultSageService vaultSageService;

    private final Map<UUID, String> statusMap = new ConcurrentHashMap<>();

    public void startAsync(String userEmail, UUID portfolioId) {
        getPortfolioForUser(userEmail, portfolioId);
        statusMap.put(portfolioId, "generating");
        runPipeline(portfolioId);
    }

    @Async
    public void runPipeline(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow();
        String orgId = portfolio.getOrganizerId();
        try {
            statusMap.put(portfolioId, "generating");
            vaultSageService.generateTree(orgId);
            pollUntilDone(() -> vaultSageService.getGenerateStatus(orgId), "generating", portfolioId);

            statusMap.put(portfolioId, "applying");
            vaultSageService.applyOrganizer(orgId);
            pollUntilDone(() -> vaultSageService.getApplyProgress(orgId), "applying", portfolioId);

            statusMap.put(portfolioId, "materializing");
            vaultSageService.materialize(orgId);
            pollUntilDone(() -> vaultSageService.getMaterializeStatus(orgId), "materializing", portfolioId);

            statusMap.put(portfolioId, "done");
            log.info("Organize pipeline completed for portfolio={}", portfolioId);
        } catch (Exception e) {
            log.error("Organize pipeline failed for portfolio={}", portfolioId, e);
            statusMap.put(portfolioId, "failed");
        }
    }

    public OrganizeStatusResponse getStatus(String userEmail, UUID portfolioId) {
        getPortfolioForUser(userEmail, portfolioId);
        String status = statusMap.getOrDefault(portfolioId, "idle");
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

    private void pollUntilDone(java.util.function.Supplier<String> statusFn,
                               String currentStep, UUID portfolioId) throws InterruptedException {
        int maxAttempts = 60;
        for (int i = 0; i < maxAttempts; i++) {
            String s = statusFn.get();
            if ("done".equals(s) || "completed".equals(s) || "success".equals(s)) return;
            if ("failed".equals(s) || "error".equals(s))
                throw new RuntimeException("Step " + currentStep + " failed");
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
