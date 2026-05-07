package com.foliosage.dto.portfolio;

import jakarta.validation.constraints.NotBlank;

public record DefenseAnswerRequest(@NotBlank String answer) {}
