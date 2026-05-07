package com.foliosage.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.portfolio.StatsResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final PortfolioRepository portfolioRepository;
    private final VaultSageService vaultSageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public void incrementViewCount(UUID portfolioId) {
        portfolioRepository.findById(portfolioId).ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            portfolioRepository.save(p);
        });
    }

    @Async
    public void incrementDownloadCount(UUID portfolioId) {
        portfolioRepository.findById(portfolioId).ifPresent(p -> {
            p.setDownloadCount(p.getDownloadCount() + 1);
            portfolioRepository.save(p);
        });
    }

    public StatsResponse getStats(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        return new StatsResponse(
                portfolio.getViewCount(),
                portfolio.getDownloadCount(),
                countTodayViews(portfolio.getVaultsageShareId()));
    }

    private int countTodayViews(String vaultsageShareId) {
        if (vaultsageShareId == null || vaultsageShareId.isBlank()) return 0;
        try {
            JsonNode root = objectMapper.readTree(vaultSageService.getAccessLogs(vaultsageShareId));
            JsonNode items = root.isArray() ? root : root.path("data");
            if (!items.isArray()) items = root.path("logs");
            if (!items.isArray()) return 0;

            LocalDate todayUtc = LocalDate.now(ZoneOffset.UTC);
            int count = 0;
            for (JsonNode item : items) {
                String timestamp = firstText(item, "created_at", "createdAt", "timestamp", "accessed_at", "accessedAt");
                if (timestamp == null) continue;
                if (OffsetDateTime.parse(timestamp).withOffsetSameInstant(ZoneOffset.UTC).toLocalDate().equals(todayUtc)) {
                    count++;
                }
            }
            return count;
        } catch (Exception e) {
            return 0;
        }
    }

    private String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = node.path(field).asText(null);
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }
}
