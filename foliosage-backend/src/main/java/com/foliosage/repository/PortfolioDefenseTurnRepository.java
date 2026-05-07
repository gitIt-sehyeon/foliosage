package com.foliosage.repository;

import com.foliosage.entity.PortfolioDefenseSession;
import com.foliosage.entity.PortfolioDefenseTurn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioDefenseTurnRepository extends JpaRepository<PortfolioDefenseTurn, UUID> {
    List<PortfolioDefenseTurn> findBySessionOrderByQuestionIndexAsc(PortfolioDefenseSession session);
    Optional<PortfolioDefenseTurn> findBySessionAndQuestionIndex(PortfolioDefenseSession session, int questionIndex);
}
