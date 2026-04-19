package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "portfolio_files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioFile {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "vaultsage_file_id", nullable = false)
    private String vaultsageFileId;

    @Column(nullable = false)
    private String name;

    @Column(name = "file_hash", nullable = false)
    private String fileHash;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @CreationTimestamp
    @Column(name = "certified_at", nullable = false, updatable = false)
    private OffsetDateTime certifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
