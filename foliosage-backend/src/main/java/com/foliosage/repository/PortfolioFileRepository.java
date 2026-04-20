package com.foliosage.repository;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PortfolioFileRepository extends JpaRepository<PortfolioFile, UUID> {
    List<PortfolioFile> findByPortfolioOrderByCreatedAtAsc(Portfolio portfolio);
    long countByPortfolio(Portfolio portfolio);
}
