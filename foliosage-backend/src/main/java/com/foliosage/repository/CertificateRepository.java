package com.foliosage.repository;

import com.foliosage.entity.Certificate;
import com.foliosage.entity.PortfolioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByFile(PortfolioFile file);
}
