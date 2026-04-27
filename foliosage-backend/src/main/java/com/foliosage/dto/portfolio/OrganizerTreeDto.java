package com.foliosage.dto.portfolio;

import java.util.List;

public record OrganizerTreeDto(List<NodeDto> nodes) {
    public record NodeDto(String id, String name, int fileCount, int childCount, List<NodeDto> children) {}
}
