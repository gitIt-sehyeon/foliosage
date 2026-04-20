package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "portfolios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Portfolio {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "organizer_id")
    private String organizerId;

    @Column(name = "directory_id")
    private String directoryId;

    @Column(name = "share_code", unique = true)
    private String shareCode;

    @Column(name = "vaultsage_share_id")
    private String vaultsageShareId;

    @Builder.Default
    @Column(name = "is_published", nullable = false)
    private boolean published = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
