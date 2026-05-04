package com.foliosage.dto.user;

import java.util.List;
import java.util.UUID;

public record PublicUserResponse(
        String username,
        String name,
        String bio,
        String location,
        String linkedinUrl,
        String githubUrl,
        int totalViews,
        List<PortfolioSummary> portfolios
) {
    public record PortfolioSummary(
            UUID id,
            String title,
            String description,
            String shareCode,
            int viewCount,
            int fileCount
    ) {}
}
