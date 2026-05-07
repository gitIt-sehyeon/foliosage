package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_defense_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioDefenseSession {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(nullable = false)
    private String status;

    @Column(name = "vaultsage_conversation_id")
    private String vaultsageConversationId;

    @Column(name = "vaultsage_session_id", nullable = false)
    private String vaultsageSessionId;

    @Column(name = "questions_json", nullable = false, columnDefinition = "TEXT")
    private String questionsJson;

    @Column(name = "scorecard_json", columnDefinition = "TEXT")
    private String scorecardJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
