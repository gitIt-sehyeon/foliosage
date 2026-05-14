package com.foliosage.dto.portfolio;

public record PortfolioReadinessResponse(
        int score,
        boolean storyReady,
        boolean evidenceReady,
        boolean aiReviewReady,
        boolean publicLinkReady,
        String nextAction
) {}
