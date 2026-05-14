package com.foliosage.dto.portfolio;

import java.util.List;

public record PortfolioStoryUpdateRequest(
        String summary,
        String role,
        String problem,
        String solution,
        String impact,
        List<PortfolioStoryResponse.EvidenceHighlightDto> evidenceHighlights,
        List<String> missingProof,
        List<String> interviewQuestions
) {}
