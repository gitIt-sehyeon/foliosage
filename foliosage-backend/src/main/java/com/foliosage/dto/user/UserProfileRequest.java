package com.foliosage.dto.user;

import jakarta.validation.constraints.Size;

public record UserProfileRequest(
        @Size(max = 50)
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
