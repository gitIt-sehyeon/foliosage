package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_defense_turns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioDefenseTurn {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private PortfolioDefenseSession session;

    @Column(name = "question_index", nullable = false)
    private int questionIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "evidence_json", columnDefinition = "TEXT")
    private String evidenceJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "answered_at")
    private OffsetDateTime answeredAt;
}
