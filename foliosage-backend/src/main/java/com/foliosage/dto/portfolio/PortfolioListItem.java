package com.foliosage.dto.portfolio;
import java.time.OffsetDateTime;
import java.util.UUID;
public record PortfolioListItem(UUID id, String title, int fileCount,
                                boolean published, OffsetDateTime createdAt) {}
