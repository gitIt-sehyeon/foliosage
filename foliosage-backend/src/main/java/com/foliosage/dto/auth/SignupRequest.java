package com.foliosage.dto.auth;

import jakarta.validation.constraints.*;

public record SignupRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String name) {}
