package com.foliosage.repository;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PortfolioStoryRepository extends JpaRepository<PortfolioStory, UUID> {
    Optional<PortfolioStory> findByPortfolio(Portfolio portfolio);
    Optional<PortfolioStory> findByPortfolioId(UUID portfolioId);
}
