package com.foliosage.dto.portfolio;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(@NotBlank String message, String conversationId) {}
