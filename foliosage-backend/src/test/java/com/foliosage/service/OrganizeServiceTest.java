package com.foliosage.service;

import com.foliosage.dto.portfolio.OrganizeStatusResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.entity.User;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class OrganizeServiceTest {

    PortfolioRepository portfolioRepo = mock(PortfolioRepository.class);
    PortfolioFileRepository fileRepo = mock(PortfolioFileRepository.class);
    VaultSageService vaultSage = mock(VaultSageService.class);
    SmartOrganizerService smartOrganizer = mock(SmartOrganizerService.class);

    OrganizeService service;

    @BeforeEach
    void setUp() {
        service = new OrganizeService(portfolioRepo, fileRepo, vaultSage, smartOrganizer);
        // inject self (normally done by Spring @Lazy)
        service.setSelf(service);
    }

    @Test
    void getStatus_returnsDbStatus_whenNotInMemory() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setOrganizeStatus("done");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));

        OrganizeStatusResponse resp = service.getStatus("user@test.com", id);

        assertThat(resp.status()).isEqualTo("done");
        assertThat(resp.message()).isEqualTo("Organization complete!");
    }

    @Test
    void getStatus_returnsIdle_whenDbStatusIsNull() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setOrganizeStatus(null);

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));

        OrganizeStatusResponse resp = service.getStatus("user@test.com", id);

        assertThat(resp.status()).isEqualTo("idle");
    }

    @Test
    void startAsync_runsFullVaultSagePipeline() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setOrganizerId("organizer-123");
        p.setDirectoryId("directory-456");

        PortfolioFile file = new PortfolioFile();
        file.setVaultsageFileId("file-789");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));
        when(fileRepo.findByPortfolioOrderByCreatedAtAsc(p)).thenReturn(List.of(file));
        when(vaultSage.getProcessingStatus("file-789")).thenReturn("completed");
        when(vaultSage.generateTree("organizer-123")).thenReturn("generate-job");
        when(vaultSage.getGenerateStatus("organizer-123", "generate-job")).thenReturn("completed");
        when(vaultSage.applyOrganizer("organizer-123")).thenReturn("apply-job");
        when(vaultSage.getApplyProgress("organizer-123", "apply-job")).thenReturn("completed");
        when(vaultSage.materialize("organizer-123")).thenReturn("materialize-job");
        when(vaultSage.getMaterializeStatus("organizer-123", "materialize-job")).thenReturn("completed");

        service.startAsync("user@test.com", id);

        InOrder inOrder = inOrder(vaultSage, smartOrganizer);
        inOrder.verify(vaultSage).generateTree("organizer-123");
        inOrder.verify(vaultSage).applyOrganizer("organizer-123");
        inOrder.verify(vaultSage).materialize("organizer-123");
        inOrder.verify(smartOrganizer).classify(id, false);
        verify(vaultSage, never()).createOrganizer(anyString(), anyString());
        assertThat(p.getOrganizeStatus()).isEqualTo("done");
    }

    @Test
    void startAsync_threadsForceFlagIntoFinalClassification() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setOrganizerId("organizer-123");
        p.setDirectoryId("directory-456");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));
        when(fileRepo.findByPortfolioOrderByCreatedAtAsc(p)).thenReturn(List.of());
        when(vaultSage.generateTree("organizer-123")).thenReturn("generate-job");
        when(vaultSage.getGenerateStatus("organizer-123", "generate-job")).thenReturn("completed");
        when(vaultSage.applyOrganizer("organizer-123")).thenReturn("apply-job");
        when(vaultSage.getApplyProgress("organizer-123", "apply-job")).thenReturn("completed");
        when(vaultSage.materialize("organizer-123")).thenReturn("materialize-job");
        when(vaultSage.getMaterializeStatus("organizer-123", "materialize-job")).thenReturn("completed");

        service.startAsync("user@test.com", id, true);

        verify(smartOrganizer).classify(id, true);
        assertThat(p.getOrganizeStatus()).isEqualTo("done");
    }

    @Test
    void startAsync_createsOrganizerOnTheFlyWhenMissing() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setTitle("Legacy Portfolio");
        p.setDirectoryId("directory-456");
        // no organizerId

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));
        when(fileRepo.findByPortfolioOrderByCreatedAtAsc(p)).thenReturn(List.of());
        when(vaultSage.createOrganizer("Legacy Portfolio", "directory-456")).thenReturn("organizer-new");
        when(vaultSage.generateTree("organizer-new")).thenReturn("generate-job");
        when(vaultSage.getGenerateStatus("organizer-new", "generate-job")).thenReturn("completed");
        when(vaultSage.applyOrganizer("organizer-new")).thenReturn("apply-job");
        when(vaultSage.getApplyProgress("organizer-new", "apply-job")).thenReturn("completed");
        when(vaultSage.materialize("organizer-new")).thenReturn("materialize-job");
        when(vaultSage.getMaterializeStatus("organizer-new", "materialize-job")).thenReturn("completed");

        service.startAsync("user@test.com", id);

        verify(vaultSage).createOrganizer("Legacy Portfolio", "directory-456");
        verify(vaultSage).generateTree("organizer-new");
        assertThat(p.getOrganizerId()).isEqualTo("organizer-new");
        assertThat(p.getOrganizeStatus()).isEqualTo("done");
    }

    @Test
    void runPipeline_marksFailedWhenAStepErrors() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setOrganizerId("organizer-123");
        p.setDirectoryId("directory-456");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));
        when(fileRepo.findByPortfolioOrderByCreatedAtAsc(p)).thenReturn(List.of());
        when(vaultSage.generateTree("organizer-123")).thenReturn("generate-job");
        when(vaultSage.getGenerateStatus("organizer-123", "generate-job")).thenReturn("failed");

        service.runPipeline(id);

        verify(vaultSage, never()).applyOrganizer(anyString());
        verify(vaultSage, never()).materialize(anyString());
        verify(smartOrganizer, never()).classify(any(UUID.class), anyBoolean());
        assertThat(p.getOrganizeStatus()).isEqualTo("failed");
    }

    @Test
    void runPipeline_scopesOrganizerToPortfolioDirectoryBeforeGeneratingTree() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setTitle("Design Portfolio");
        p.setOrganizerId("organizer-123");
        p.setDirectoryId("directory-456");

        PortfolioFile file = new PortfolioFile();
        file.setVaultsageFileId("file-789");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));
        when(fileRepo.findByPortfolioOrderByCreatedAtAsc(p)).thenReturn(List.of(file));
        when(vaultSage.getProcessingStatus("file-789")).thenReturn("completed");
        when(vaultSage.generateTree("organizer-123")).thenReturn("generate-job");
        when(vaultSage.getGenerateStatus("organizer-123", "generate-job")).thenReturn("completed");
        when(vaultSage.applyOrganizer("organizer-123")).thenReturn("apply-job");
        when(vaultSage.getApplyProgress("organizer-123", "apply-job")).thenReturn("completed");
        when(vaultSage.materialize("organizer-123")).thenReturn("materialize-job");
        when(vaultSage.getMaterializeStatus("organizer-123", "materialize-job")).thenReturn("completed");

        service.runPipeline(id);

        verify(vaultSage).updateOrganizerScope("organizer-123", "directory-456");
        verify(vaultSage).generateTree("organizer-123");
        verify(vaultSage, never()).createNode(anyString(), anyString());
        verify(vaultSage, never()).assignFilesToNode(anyString(), anyString(), anyList());
        assertThat(p.getOrganizeStatus()).isEqualTo("done");
    }
}
