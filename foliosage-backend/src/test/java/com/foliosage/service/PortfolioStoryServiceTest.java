package com.foliosage.service;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.entity.User;
import com.foliosage.repository.PortfolioDefenseSessionRepository;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.PortfolioStoryRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PortfolioStoryServiceTest {

    @Test
    void buildPrompt_includesAllUploadedFiles() {
        PortfolioStoryService service = new PortfolioStoryService(null, null, null, null, null);
        Portfolio portfolio = Portfolio.builder().title("Hiring OS").description("ATS project").build();
        List<PortfolioFile> files = List.of(
                PortfolioFile.builder().id(UUID.randomUUID()).name("case-study.pdf").vaultsageFileId("vs-1").description("Case study").build(),
                PortfolioFile.builder().id(UUID.randomUUID()).name("metrics.csv").vaultsageFileId("vs-2").description("Outcome metrics").build()
        );

        String prompt = service.buildPrompt(portfolio, files);

        assertThat(prompt).contains("case-study.pdf", "vs-1", "metrics.csv", "vs-2");
        assertThat(prompt).contains("반드시 자연스러운 한국어로만 작성하세요");
    }

    @Test
    void parseDraft_readsValidAiJson() {
        PortfolioStoryService service = new PortfolioStoryService(null, null, null, null, null);
        UUID fileId = UUID.randomUUID();
        PortfolioFile file = PortfolioFile.builder()
                .id(fileId)
                .name("demo.pdf")
                .vaultsageFileId("vs-demo")
                .build();

        var draft = service.parseDraft("""
                {"summary":"Ready summary","role":"Lead","problem":"Problem","solution":"Solution","impact":"Impact",
                "evidenceHighlights":[{"fileId":"ignored","vaultsageFileId":"vs-demo","fileName":"demo.pdf","reason":"Shows proof"}],
                "missingProof":["More metrics"],"interviewQuestions":["What changed?"]}
                """, List.of(file));

        assertThat(draft).isPresent();
        assertThat(draft.get().summary()).isEqualTo("Ready summary");
        assertThat(draft.get().evidenceHighlights()).hasSize(1);
        assertThat(draft.get().evidenceHighlights().get(0).fileId()).isEqualTo(fileId);
        assertThat(draft.get().interviewQuestions()).containsExactly("What changed?");
    }

    @Test
    void generate_invalidAiResponseFallsBackWithoutCrashing() {
        PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
        PortfolioFileRepository fileRepository = mock(PortfolioFileRepository.class);
        PortfolioStoryRepository storyRepository = mock(PortfolioStoryRepository.class);
        PortfolioDefenseSessionRepository defenseRepository = mock(PortfolioDefenseSessionRepository.class);
        VaultSageService vaultSageService = mock(VaultSageService.class);
        PortfolioStoryService service = new PortfolioStoryService(
                portfolioRepository, fileRepository, storyRepository, defenseRepository, vaultSageService);

        UUID portfolioId = UUID.randomUUID();
        Portfolio portfolio = Portfolio.builder()
                .id(portfolioId)
                .title("Creator OS")
                .description("A portfolio project")
                .user(User.builder().email("creator@example.com").build())
                .published(true)
                .shareCode("share-123")
                .build();
        PortfolioFile file = PortfolioFile.builder()
                .id(UUID.randomUUID())
                .portfolio(portfolio)
                .name("evidence.pdf")
                .vaultsageFileId("vs-evidence")
                .build();
        when(portfolioRepository.findById(portfolioId)).thenReturn(Optional.of(portfolio));
        when(fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio)).thenReturn(List.of(file));
        when(storyRepository.findByPortfolio(portfolio)).thenReturn(Optional.empty());
        when(storyRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(vaultSageService.publicChat(eq("share-123"), any(), any(), any())).thenReturn("not json");

        var response = service.generate("creator@example.com", portfolioId);

        assertThat(response.status()).isEqualTo("ready");
        assertThat(response.summary()).isEqualTo("A portfolio project");
        assertThat(response.evidenceHighlights()).hasSize(1);
        assertThat(response.interviewQuestions().get(0)).contains("본인이 직접 맡은 역할");
    }
}
