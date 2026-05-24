package com.foliosage.config;

import com.foliosage.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrganizeStatusResetRunner implements ApplicationRunner {

    private final PortfolioRepository portfolioRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<String> staleStatuses = List.of("generating", "applying", "materializing");
        var stale = portfolioRepository.findByOrganizeStatusIn(staleStatuses);
        if (!stale.isEmpty()) {
            stale.forEach(p -> p.setOrganizeStatus("failed"));
            portfolioRepository.saveAll(stale);
            log.info("Reset {} stale organize status(es) to 'failed' on startup", stale.size());
        }
    }
}
