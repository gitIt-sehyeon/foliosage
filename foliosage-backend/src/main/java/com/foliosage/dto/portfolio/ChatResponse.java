package com.foliosage.dto.portfolio;

import java.util.List;

public record ChatResponse(
        String message,
        String conversationId,
        String role,
        List<DefenseDtos.EvidenceChipDto> evidence
) {
    public ChatResponse(String message, String conversationId, String role) {
        this(message, conversationId, role, List.of());
    }
}
