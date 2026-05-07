package com.foliosage.dto.portfolio;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class DefenseDtos {
    private DefenseDtos() {}

    public record EvidenceChipDto(
            UUID fileId,
            String vaultsageFileId,
            String name,
            String fileHash,
            String certifiedAt,
            String reason
    ) {}

    public record DefenseTurnResponse(
            UUID id,
            int questionIndex,
            String question,
            String answer,
            String feedback,
            List<EvidenceChipDto> evidence,
            boolean answered
    ) {}

    public record ScoreCategoryDto(String name, int score, String rationale) {}

    public record DefenseScorecardDto(
            int overallScore,
            List<ScoreCategoryDto> categories,
            List<String> missingProof,
            String summary
    ) {}

    public record DefenseSessionResponse(
            UUID id,
            String status,
            int currentQuestionIndex,
            int totalQuestions,
            List<DefenseTurnResponse> turns,
            DefenseScorecardDto scorecard,
            OffsetDateTime createdAt,
            OffsetDateTime completedAt
    ) {}

    public record PublicDefenseResponse(
            boolean available,
            DefenseSessionResponse session,
            int citedFileCount,
            int totalEvidenceCount
    ) {}
}
