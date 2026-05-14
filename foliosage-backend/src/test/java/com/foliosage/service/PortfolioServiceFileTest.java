package com.foliosage.service;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.entity.User;
import com.foliosage.repository.CertificateRepository;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class PortfolioServiceFileTest {

    PortfolioRepository portfolioRepo = mock(PortfolioRepository.class);
    PortfolioFileRepository fileRepo = mock(PortfolioFileRepository.class);
    CertificateRepository certRepo = mock(CertificateRepository.class);
    UserRepository userRepo = mock(UserRepository.class);
    VaultSageService vaultSage = mock(VaultSageService.class);

    PortfolioService service = new PortfolioService(portfolioRepo, fileRepo, certRepo, userRepo, vaultSage, null, null, null);

    @Test
    void deleteFile_throws403_whenFileDoesNotBelongToPortfolio() {
        UUID portfolioId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();

        User user = new User(); user.setEmail("user@test.com");
        Portfolio portfolio = new Portfolio(); portfolio.setId(portfolioId); portfolio.setUser(user);
        Portfolio other = new Portfolio(); other.setId(UUID.randomUUID()); other.setUser(user);
        PortfolioFile file = new PortfolioFile(); file.setId(fileId);
        file.setPortfolio(other); // belongs to a DIFFERENT portfolio
        file.setVaultsageFileId("vs-id");

        when(portfolioRepo.findById(portfolioId)).thenReturn(Optional.of(portfolio));
        when(fileRepo.findById(fileId)).thenReturn(Optional.of(file));

        assertThatThrownBy(() -> service.deleteFile("user@test.com", portfolioId, fileId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403");
    }

    @Test
    void deleteFile_callsVaultSageAndDbDelete_onSuccess() {
        UUID portfolioId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();

        User user = new User(); user.setEmail("user@test.com");
        Portfolio portfolio = new Portfolio(); portfolio.setId(portfolioId); portfolio.setUser(user);
        PortfolioFile file = new PortfolioFile(); file.setId(fileId);
        file.setPortfolio(portfolio); // belongs to the SAME portfolio
        file.setVaultsageFileId("vs-id-123");

        when(portfolioRepo.findById(portfolioId)).thenReturn(Optional.of(portfolio));
        when(fileRepo.findById(fileId)).thenReturn(Optional.of(file));

        service.deleteFile("user@test.com", portfolioId, fileId);

        verify(vaultSage).deleteFile("vs-id-123");
        verify(fileRepo).delete(file);
    }
}
