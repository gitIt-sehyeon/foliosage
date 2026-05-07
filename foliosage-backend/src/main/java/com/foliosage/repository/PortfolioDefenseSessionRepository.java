package com.foliosage.repository;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioDefenseSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PortfolioDefenseSessionRepository extends JpaRepository<PortfolioDefenseSession, UUID> {
    Optional<PortfolioDefenseSession> findFirstByPortfolioOrderByCreatedAtDesc(Portfolio portfolio);
    Optional<PortfolioDefenseSession> findFirstByPortfolioAndStatusOrderByCompletedAtDesc(Portfolio portfolio, String status);
}
