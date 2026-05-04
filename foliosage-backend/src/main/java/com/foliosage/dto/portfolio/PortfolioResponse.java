package com.foliosage.dto.portfolio;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PortfolioResponse(
        UUID id, String title, String description,
        String organizerId, String shareCode, boolean published,
        OffsetDateTime createdAt, List<PortfolioFileDto> files
) {
    public record PortfolioFileDto(UUID id, String name, String vaultsageFileId,
                                   String fileHash, String mimeType, OffsetDateTime certifiedAt,
                                   String description) {}
}
