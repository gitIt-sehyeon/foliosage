package com.foliosage.dto.user;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileRequest(
        @Size(min = 3, max = 50)
        @Pattern(regexp = "^[a-z0-9_-]+$", message = "Username may only contain lowercase letters, digits, hyphens, and underscores")
        String username,

        @Size(max = 300)
        String bio,

        @Size(max = 100)
        String location,

        @Size(max = 255)
        String linkedinUrl,

        @Size(max = 255)
        String githubUrl
) {}
