package com.foliosage.service;

import com.foliosage.dto.portfolio.DefenseDtos.EvidenceChipDto;
import com.foliosage.dto.portfolio.DefenseDtos.ScoreCategoryDto;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DefenseServiceTest {

    DefenseService service = new DefenseService(null, null, null, null, null, null);

    @Test
    void parseQuestions_readsJsonArray() {
        List<String> questions = service.parseQuestions("""
                {"questions":["Q1","Q2","Q3","Q4","Q5"]}
                """);

        assertThat(questions).containsExactly("Q1", "Q2", "Q3", "Q4", "Q5");
    }

    @Test
    void parseQuestions_fallsBackWhenJsonIsInvalid() {
        List<String> questions = service.parseQuestions("not json");

        assertThat(questions).hasSize(5);
        assertThat(questions.get(0)).contains("최소 3개");
    }

    @Test
    void buildQuestionPrompt_requiresCoverageAcrossDistinctFiles() {
        Portfolio portfolio = Portfolio.builder()
                .title("Creator OS")
                .description("Design and engineering portfolio")
                .build();
        List<PortfolioFile> files = List.of(
                PortfolioFile.builder().name("Brand system.pdf").vaultsageFileId("vs-brand").fileHash("abcdef0123456789").build(),
                PortfolioFile.builder().name("Research notes.md").vaultsageFileId("vs-notes").fileHash("1234567890abcdef").build(),
                PortfolioFile.builder().name("Prototype demo.mov").vaultsageFileId("vs-demo").fileHash("fedcba0987654321").build()
        );

        String prompt = service.buildQuestionPrompt(portfolio, files);

        assertThat(prompt).contains("사용자에게 보이는 모든 응답은 반드시 자연스러운 한국어로만 작성하세요");
        assertThat(prompt).contains("영어로 번역하거나 영어 문장으로 답하지 마세요");
        assertThat(prompt).contains("첫 번째 파일에만 집중하지 말고");
        assertThat(prompt).contains("[1/3] Brand system.pdf");
        assertThat(prompt).contains("[2/3] Research notes.md");
        assertThat(prompt).contains("[3/3] Prototype demo.mov");
    }

    @Test
    void matchEvidence_matchesFilenameAndVaultSageFileId() {
        PortfolioFile brand = PortfolioFile.builder()
                .id(UUID.randomUUID())
                .name("Brand system.pdf")
                .vaultsageFileId("vs-brand")
                .fileHash("abcdef0123456789")
                .certifiedAt(OffsetDateTime.parse("2026-05-01T00:00:00Z"))
                .build();
        PortfolioFile notes = PortfolioFile.builder()
                .id(UUID.randomUUID())
                .name("Research notes.md")
                .vaultsageFileId("vs-notes")
                .fileHash("1234567890abcdef")
                .certifiedAt(OffsetDateTime.parse("2026-05-02T00:00:00Z"))
                .build();

        List<EvidenceChipDto> evidence = service.matchEvidence(
                List.of("Evidence: Brand system.pdf and vs-notes"),
                List.of(brand, notes),
                "matched"
        );

        assertThat(evidence).extracting(EvidenceChipDto::name)
                .containsExactly("Brand system.pdf", "Research notes.md");
    }

    @Test
    void parseScorecard_readsCategoryJson() {
        var scorecard = service.parseScorecard("""
                {"overallScore":88,"categories":[{"name":"Originality","score":91,"rationale":"Strong"}],"missingProof":["metrics"],"summary":"Ready"}
                """);

        assertThat(scorecard.overallScore()).isEqualTo(88);
        assertThat(scorecard.categories()).extracting(ScoreCategoryDto::name).containsExactly("Originality");
        assertThat(scorecard.missingProof()).containsExactly("metrics");
    }
}
