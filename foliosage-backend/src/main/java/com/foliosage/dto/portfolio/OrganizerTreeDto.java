package com.foliosage.dto.portfolio;

import java.util.List;

public record OrganizerTreeDto(List<NodeDto> nodes) {
    public record NodeDto(String id, String name, int fileCount, int childCount,
                          List<NodeDto> children, List<FileDto> files) {}

    public record FileDto(String fileId, String name, Long size, String category) {}
}
