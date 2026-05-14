package com.foliosage.service;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.User;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PublishServiceTest {

    @Test
    void buildShareUrl_appendsShareCodeToBaseUrl() {
        PublishService service = new PublishService(null, null, null, "https://foliosage.app");
        String url = service.buildShareUrl("abc123");
        assertThat(url).isEqualTo("https://foliosage.app/p/abc123");
    }

    @Test
    void publish_reusesExistingShareCodeAndMarksPublished() {
        PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
        PortfolioFileRepository fileRepository = mock(PortfolioFileRepository.class);
        PublishService service = new PublishService(portfolioRepository, fileRepository, null, "https://foliosage.app");
        UUID portfolioId = UUID.randomUUID();
        Portfolio portfolio = Portfolio.builder()
                .id(portfolioId)
                .user(User.builder().email("creator@example.com").build())
                .shareCode("abc123")
                .vaultsageShareId("abc123")
                .published(false)
                .build();
        when(portfolioRepository.findByIdWithLock(portfolioId)).thenReturn(Optional.of(portfolio));

        var response = service.publish("creator@example.com", portfolioId);

        assertThat(response.shareCode()).isEqualTo("abc123");
        assertThat(portfolio.isPublished()).isTrue();
        verify(portfolioRepository).save(portfolio);
        verifyNoInteractions(fileRepository);
    }

    @Test
    void unpublish_marksPortfolioPrivateButKeepsShareIdentifiers() {
        PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
        PublishService service = new PublishService(portfolioRepository, null, null, "https://foliosage.app");
        UUID portfolioId = UUID.randomUUID();
        Portfolio portfolio = Portfolio.builder()
                .id(portfolioId)
                .user(User.builder().email("creator@example.com").build())
                .shareCode("abc123")
                .vaultsageShareId("vault-share")
                .published(true)
                .build();
        when(portfolioRepository.findByIdWithLock(portfolioId)).thenReturn(Optional.of(portfolio));

        var response = service.unpublish("creator@example.com", portfolioId);

        assertThat(response.shareCode()).isEqualTo("abc123");
        assertThat(response.shareUrl()).isEqualTo("https://foliosage.app/p/abc123");
        assertThat(portfolio.isPublished()).isFalse();
        assertThat(portfolio.getShareCode()).isEqualTo("abc123");
        assertThat(portfolio.getVaultsageShareId()).isEqualTo("vault-share");
        verify(portfolioRepository).save(portfolio);
    }
}
