package com.foliosage.controller;

import com.foliosage.dto.user.UserProfileRequest;
import com.foliosage.entity.User;
import com.foliosage.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserProfileResponse me(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(), user.getUsername(),
                user.getBio(), user.getLocation(), user.getLinkedinUrl(), user.getGithubUrl());
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<Void> updateProfile(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody UserProfileRequest req) {
        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.username() != null) {
            if (userRepository.findByUsername(req.username()).filter(u -> !u.getId().equals(user.getId())).isPresent())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
            user.setUsername(req.username());
        }
        if (req.bio() != null) user.setBio(req.bio());
        if (req.location() != null) user.setLocation(req.location());
        if (req.linkedinUrl() != null) user.setLinkedinUrl(req.linkedinUrl());
        if (req.githubUrl() != null) user.setGithubUrl(req.githubUrl());
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    public record UserProfileResponse(
            java.util.UUID id, String name, String email, String username,
            String bio, String location, String linkedinUrl, String githubUrl) {}
}
