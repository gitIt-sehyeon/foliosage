package com.foliosage.dto.portfolio;

import java.util.List;
import java.util.UUID;

public record OrganizerResultDto(
    String status,           // "idle" | "running" | "done" | "failed"
    int totalFiles,
    int classifiedFiles,
    int progressPercent,
    String reasoning,
    List<CategoryDto> categories
) {
    public record CategoryDto(
        String key,
        String label,
        String subtitle,
        int fileCount,
        List<FileClassificationDto> files
    ) {}

    public record FileClassificationDto(
        UUID fileId,
        String name,
        Long size,
        int confidence,
        String reasoning,
        boolean locked
    ) {}
}
