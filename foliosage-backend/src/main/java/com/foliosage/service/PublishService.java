package com.foliosage.service;

import com.foliosage.dto.portfolio.PublishResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service @Slf4j
public class PublishService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final VaultSageService vaultSageService;
    private final String baseUrl;

    public PublishService(PortfolioRepository portfolioRepository,
                          PortfolioFileRepository fileRepository,
                          VaultSageService vaultSageService,
                          @Value("${app.base-url}") String baseUrl) {
        this.portfolioRepository = portfolioRepository;
        this.fileRepository = fileRepository;
        this.vaultSageService = vaultSageService;
        this.baseUrl = baseUrl;
    }

    @Transactional
    public PublishResponse publish(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);

        if (portfolio.getShareCode() != null)
            return new PublishResponse(portfolio.getShareCode(), buildShareUrl(portfolio.getShareCode()));

        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);
        if (files.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload files before publishing");

        String[] fileIds = files.stream().map(PortfolioFile::getVaultsageFileId).toArray(String[]::new);
        String shareCode = vaultSageService.createShare(fileIds);
        if (shareCode == null || shareCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "VaultSage share creation failed");
        }

        portfolio.setShareCode(shareCode);
        portfolio.setVaultsageShareId(shareCode);
        portfolio.setPublished(true);
        portfolioRepository.save(portfolio);

        return new PublishResponse(portfolio.getShareCode(), buildShareUrl(portfolio.getShareCode()));
    }

    public String buildShareUrl(String shareCode) {
        return baseUrl + "/p/" + shareCode;
    }

    @Transactional(readOnly = true)
    public String getVisitorLogs(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        if (portfolio.getVaultsageShareId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio not published yet");
        return vaultSageService.getAccessLogs(portfolio.getVaultsageShareId());
    }

    private Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!p.getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        return p;
    }
}
