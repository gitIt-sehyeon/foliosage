package com.foliosage.repository;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserOrderByCreatedAtDesc(User user);
    Optional<Portfolio> findByShareCode(String shareCode);
}
