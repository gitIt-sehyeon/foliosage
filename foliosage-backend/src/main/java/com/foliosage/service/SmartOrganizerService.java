package com.foliosage.service;

import com.foliosage.dto.portfolio.OrganizerResultDto;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmartOrganizerService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;

    private record CategoryDef(String key, String label, String subtitle) {}

    private static final List<CategoryDef> CATEGORY_DEFS = List.of(
        new CategoryDef("system",      "시스템", "토큰 · 가이드 · 컴포넌트"),
        new CategoryDef("visual",      "비주얼", "키 비주얼 · 무드 · 마이크로사이트"),
        new CategoryDef("document",    "문서",   "노트 · 리서치 · 의사결정"),
        new CategoryDef("deliverable", "산출물", "최종 산출물 · 납품")
    );

    public OrganizerResultDto getResult(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);

        String orgStatus = portfolio.getOrganizeStatus();
        String resultStatus = toResultStatus(orgStatus);
        int progressPercent = toProgressPercent(orgStatus);

        long classified = files.stream().filter(f -> f.getCategory() != null).count();

        Map<String, List<PortfolioFile>> byCategory = files.stream()
            .filter(f -> f.getCategory() != null)
            .collect(Collectors.groupingBy(PortfolioFile::getCategory));

        List<OrganizerResultDto.CategoryDto> categories = CATEGORY_DEFS.stream()
            .map(def -> {
                List<PortfolioFile> catFiles = byCategory.getOrDefault(def.key(), List.of());
                return new OrganizerResultDto.CategoryDto(
                    def.key(), def.label(), def.subtitle(),
                    catFiles.size(),
                    catFiles.stream().map(f -> new OrganizerResultDto.FileClassificationDto(
                        f.getId(), f.getName(), f.getFileSize(),
                        f.getCategoryConfidence() != null ? f.getCategoryConfidence() : 0,
                        f.getCategoryReasoning(),
                        Boolean.TRUE.equals(f.getCategoryLocked())
                    )).toList()
                );
            })
            .toList();

        String reasoning = classified > 0 ? buildReasoning(byCategory) : null;
        return new OrganizerResultDto(resultStatus, files.size(), (int) classified,
                                      progressPercent, reasoning, categories);
    }

    @Transactional
    public OrganizerResultDto.FileClassificationDto updateCategory(
            String userEmail, UUID portfolioId, UUID fileId, String newCategory) {
        getPortfolioForUser(userEmail, portfolioId);
        PortfolioFile file = fileRepository.findById(fileId)
            .filter(f -> f.getPortfolio().getId().equals(portfolioId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        file.setCategory(newCategory);
        file.setCategoryLocked(true);
        file.setCategoryConfidence(100);
        file.setCategoryReasoning("사용자가 직접 지정한 카테고리입니다.");
        fileRepository.save(file);

        return new OrganizerResultDto.FileClassificationDto(
            file.getId(), file.getName(), file.getFileSize(),
            100, "사용자가 직접 지정한 카테고리입니다.", true
        );
    }

    public OrganizerResultDto confirm(String userEmail, UUID portfolioId) {
        return getResult(userEmail, portfolioId);
    }

    // no-op stub — real classify logic added in Task 5
    @Transactional
    public void classify(UUID portfolioId) {
    }

    private String toResultStatus(String orgStatus) {
        if (orgStatus == null) return "idle";
        return switch (orgStatus) {
            case "done"   -> "done";
            case "failed" -> "failed";
            default       -> "running";
        };
    }

    private int toProgressPercent(String orgStatus) {
        if (orgStatus == null) return 0;
        return switch (orgStatus) {
            case "generating"    -> 30;
            case "applying"      -> 70;
            case "materializing" -> 90;
            case "done"          -> 100;
            default              -> 0;
        };
    }

    private String buildReasoning(Map<String, List<PortfolioFile>> byCategory) {
        return String.format(
            "이번 분류에서 시스템 %d개, 비주얼 %d개, 문서 %d개, 산출물 %d개로 구성되었습니다. " +
            "잘못된 분류는 드래그로 수정할 수 있어요.",
            byCategory.getOrDefault("system",      List.of()).size(),
            byCategory.getOrDefault("visual",      List.of()).size(),
            byCategory.getOrDefault("document",    List.of()).size(),
            byCategory.getOrDefault("deliverable", List.of()).size()
        );
    }

    Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!p.getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        return p;
    }
}
