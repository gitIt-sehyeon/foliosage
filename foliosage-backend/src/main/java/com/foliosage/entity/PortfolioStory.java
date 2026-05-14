package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_stories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioStory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, unique = true)
    private Portfolio portfolio;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String role;

    @Column(columnDefinition = "TEXT")
    private String problem;

    @Column(columnDefinition = "TEXT")
    private String solution;

    @Column(columnDefinition = "TEXT")
    private String impact;

    @Column(name = "evidence_highlights_json", columnDefinition = "TEXT")
    private String evidenceHighlightsJson;

    @Column(name = "missing_proof_json", columnDefinition = "TEXT")
    private String missingProofJson;

    @Column(name = "interview_questions_json", columnDefinition = "TEXT")
    private String interviewQuestionsJson;

    @Column(nullable = false)
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "generated_at")
    private OffsetDateTime generatedAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = OffsetDateTime.now();
    }
}
