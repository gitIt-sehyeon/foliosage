package com.foliosage.dto.portfolio;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PortfolioStoryResponse(
        UUID id,
        String summary,
        String role,
        String problem,
        String solution,
        String impact,
        List<EvidenceHighlightDto> evidenceHighlights,
        List<String> missingProof,
        List<String> interviewQuestions,
        String status,
        String errorMessage,
        OffsetDateTime generatedAt,
        OffsetDateTime updatedAt
) {
    public record EvidenceHighlightDto(
            UUID fileId,
            String vaultsageFileId,
            String fileName,
            String reason
    ) {}
}
