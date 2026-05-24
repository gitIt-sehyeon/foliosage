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
import java.util.ArrayList;

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

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public OrganizerResultDto confirm(String userEmail, UUID portfolioId) {
        return getResult(userEmail, portfolioId);
    }

    @Transactional
    public void classify(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow();
        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);

        List<PortfolioFile> toSave = new ArrayList<>();
        for (PortfolioFile file : files) {
            if (Boolean.TRUE.equals(file.getCategoryLocked())) continue;
            String ext = extractExt(file.getName());
            String category = classifyByExtensionAndName(file.getName(), ext, file.getMimeType());
            file.setCategory(category);
            file.setCategoryConfidence(calculateConfidence(file.getName(), ext, file.getMimeType(), category));
            file.setCategoryReasoning(generateReasoning(file.getName(), ext, category));
            toSave.add(file);
        }
        fileRepository.saveAll(toSave);
    }

    String classifyByExtensionAndName(String name, String ext, String mimeType) {
        String n = name.toLowerCase();

        if (Set.of("zip","tar","gz","7z","rar","tgz").contains(ext)) return "deliverable";
        if (n.matches(".*\\b(final|deliver|export|완성|납품|handoff)\\b.*")) return "deliverable";

        if (Set.of("json","yaml","yml","css","ts","tsx","js","jsx","mjs","cjs").contains(ext)) return "system";
        if (n.matches(".*\\b(system|token|guide|component|spec|brand|style.?guide)\\b.*")) return "system";

        if (Set.of("png","jpg","jpeg","gif","webp","svg","fig","sketch","psd","ai","xd","mp4","mov","avi","webm").contains(ext)) return "visual";
        if (mimeType != null && mimeType.startsWith("image/")) return "visual";
        if (mimeType != null && mimeType.startsWith("video/")) return "visual";

        if (Set.of("pdf","md","txt","docx","doc","pptx","ppt","key","xlsx","xls","rtf","pages","numbers").contains(ext)) return "document";

        return "document";
    }

    int calculateConfidence(String name, String ext, String mimeType, String category) {
        return switch (category) {
            case "deliverable" -> Set.of("zip","tar","gz","7z","rar","tgz").contains(ext) ? 97 : 83;
            case "system"      -> Set.of("json","yaml","yml","css","ts","tsx","js","jsx").contains(ext) ? 94 : 79;
            case "visual"      -> Set.of("png","jpg","jpeg","gif","webp","svg","fig","sketch","psd","ai").contains(ext) ? 95 : 81;
            case "document"    -> Set.of("pdf","md","txt","docx","pptx","key").contains(ext) ? 91 : 73;
            default            -> 70;
        };
    }

    String generateReasoning(String name, String ext, String category) {
        return switch (category) {
            case "system"      -> "." + ext + " 파일은 코드·설정·토큰으로 시스템 카테고리에 분류됩니다.";
            case "visual"      -> "." + ext + " 파일은 이미지·디자인 에셋으로 비주얼 카테고리에 분류됩니다.";
            case "document"    -> "." + ext + " 파일은 문서·노트로 문서 카테고리에 분류됩니다.";
            case "deliverable" -> "." + ext + " 파일은 최종 납품물로 산출물 카테고리에 분류됩니다.";
            default            -> "파일명과 확장자를 기반으로 분류되었습니다.";
        };
    }

    private String extractExt(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
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
