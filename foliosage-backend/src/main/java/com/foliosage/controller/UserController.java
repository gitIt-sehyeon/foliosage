package com.foliosage.controller;

import com.foliosage.dto.user.UserProfileRequest;
import com.foliosage.entity.User;
import com.foliosage.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-z0-9_-]+$");

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserProfileResponse me(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toResponse(user);
    }

    @PatchMapping("/me/profile")
    @Transactional
    public UserProfileResponse updateProfile(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody UserProfileRequest req) {
        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        String username = normalizeUsername(req.username());
        if (username != null) {
            if (username.length() < 3)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be at least 3 characters");
            if (!USERNAME_PATTERN.matcher(username).matches())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username may only contain letters, digits, hyphens, and underscores");
            if (userRepository.findByUsername(username).filter(u -> !u.getId().equals(user.getId())).isPresent())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        user.setUsername(username);
        user.setBio(blankToNull(req.bio()));
        user.setLocation(blankToNull(req.location()));
        user.setLinkedinUrl(blankToNull(req.linkedinUrl()));
        user.setGithubUrl(blankToNull(req.githubUrl()));
        userRepository.save(user);
        return toResponse(user);
    }

    public record UserProfileResponse(
            UUID id, String name, String email, String username,
            String bio, String location, String linkedinUrl, String githubUrl) {}

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(), user.getUsername(),
                user.getBio(), user.getLocation(), user.getLinkedinUrl(), user.getGithubUrl());
    }

    private String normalizeUsername(String value) {
        String cleaned = blankToNull(value);
        return cleaned == null ? null : cleaned.toLowerCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
