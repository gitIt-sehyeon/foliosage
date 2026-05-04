package com.foliosage.dto.portfolio;

import jakarta.validation.constraints.Size;

public record FileUpdateRequest(@Size(max = 500) String description) {}
