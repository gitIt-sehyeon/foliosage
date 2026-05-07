package com.foliosage.service;

import com.foliosage.dto.portfolio.StatsResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.repository.PortfolioRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class StatsServiceTest {

    PortfolioRepository portfolioRepo = mock(PortfolioRepository.class);
    VaultSageService vaultSage = mock(VaultSageService.class);

    @Test
    void getStats_returnsTodayViewsZero_whenVaultSageFails() {
        UUID id = UUID.randomUUID();
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setViewCount(10);
        p.setDownloadCount(3);
        p.setVaultsageShareId("share123");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));
        when(vaultSage.getAccessLogs("share123")).thenThrow(new RuntimeException("VaultSage down"));

        StatsService service = new StatsService(portfolioRepo, vaultSage);
        StatsResponse resp = service.getStats(id);

        assertThat(resp.viewCount()).isEqualTo(10);
        assertThat(resp.downloadCount()).isEqualTo(3);
        assertThat(resp.todayViews()).isEqualTo(0); // best-effort, graceful fallback
    }
}
