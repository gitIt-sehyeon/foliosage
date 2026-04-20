package com.foliosage.dto.portfolio;
import jakarta.validation.constraints.NotBlank;
public record CreatePortfolioRequest(@NotBlank String title, String description) {}
