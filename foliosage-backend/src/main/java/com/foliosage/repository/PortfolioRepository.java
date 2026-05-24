package com.foliosage.repository;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserOrderByCreatedAtDesc(User user);
    Optional<Portfolio> findByShareCode(String shareCode);
    List<Portfolio> findByUserAndPublishedTrue(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Portfolio p WHERE p.id = :id")
    Optional<Portfolio> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT p FROM Portfolio p WHERE p.organizeStatus IN :statuses")
    List<Portfolio> findByOrganizeStatusIn(@Param("statuses") List<String> statuses);
}
