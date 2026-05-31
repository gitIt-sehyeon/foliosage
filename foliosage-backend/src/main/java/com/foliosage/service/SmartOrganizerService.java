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
        new CategoryDef("system",      "System", "Code · configuration · components"),
        new CategoryDef("visual",      "Visual", "Images · video · design assets"),
        new CategoryDef("document",    "Document", "Notes · research · decisions"),
        new CategoryDef("deliverable", "Deliverable", "Final outputs · handoff files")
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
        file.setCategoryReasoning("This category was manually selected by the creator.");
        fileRepository.save(file);

        return new OrganizerResultDto.FileClassificationDto(
            file.getId(), file.getName(), file.getFileSize(),
            100, "This category was manually selected by the creator.", true
        );
    }

    @Transactional(readOnly = true)
    public OrganizerResultDto confirm(String userEmail, UUID portfolioId) {
        return getResult(userEmail, portfolioId);
    }

    @Transactional
    public void classify(UUID portfolioId) {
        classify(portfolioId, false);
    }

    @Transactional
    public void classify(UUID portfolioId, boolean force) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow();
        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);

        List<PortfolioFile> toSave = new ArrayList<>();
        for (PortfolioFile file : files) {
            if (!force && Boolean.TRUE.equals(file.getCategoryLocked())) continue;
            String ext = extractExt(file.getName());
            String category = classifyByExtensionAndName(file.getName(), ext, file.getMimeType());
            file.setCategory(category);
            file.setCategoryConfidence(calculateConfidence(file.getName(), ext, file.getMimeType(), category));
            file.setCategoryReasoning(generateReasoning(file.getName(), ext, category));
            if (force) file.setCategoryLocked(false);
            toSave.add(file);
        }
        fileRepository.saveAll(toSave);
    }

    String classifyByExtensionAndName(String name, String ext, String mimeType) {
        String n = name.toLowerCase();

        if (Set.of("zip","tar","gz","7z","rar","tgz").contains(ext)) return "deliverable";
        if (hasDeliverableSignal(n)) return "deliverable";

        if (Set.of("java","py","kt","go","rs","cpp","c","h","hpp","cs",
                "json","yaml","yml","xml","css","html","ts","tsx","js","jsx","mjs","cjs",
                "sh","sql").contains(ext)) return "system";
        if (n.matches(".*\\b(system|token|guide|component|spec|brand|style.?guide)\\b.*")) return "system";

        if (Set.of("png","jpg","jpeg","gif","webp","svg","fig","sketch","psd","ai","xd","mp4","mov","avi","webm").contains(ext)) return "visual";
        if (mimeType != null && mimeType.startsWith("image/")) return "visual";
        if (mimeType != null && mimeType.startsWith("video/")) return "visual";

        if (Set.of("pdf","md","txt","docx","doc","pptx","ppt","key","xlsx","xls","rtf","pages","numbers").contains(ext)) return "document";

        return "document";
    }

    private boolean hasDeliverableSignal(String normalizedName) {
        String padded = normalizedName
                .replace('_', ' ')
                .replace('-', ' ')
                .replace('.', ' ');
        boolean englishSignal = padded.matches(".*\\b(final|finalized|complete|completed|deliverable|deliverables|deliver|delivered|delivery|export|exported|handoff|submission|submit|submitted|release|released|launch|launched|ship|shipped|build|archive|package)\\b.*");
        if (englishSignal) return true;
        return normalizedName.contains("최종")
                || normalizedName.contains("최종본")
                || normalizedName.contains("완성")
                || normalizedName.contains("완성본")
                || normalizedName.contains("납품")
                || normalizedName.contains("제출")
                || normalizedName.contains("제출본")
                || normalizedName.contains("산출물")
                || normalizedName.contains("결과물")
                || normalizedName.contains("배포")
                || normalizedName.contains("릴리즈")
                || normalizedName.contains("출시");
    }

    int calculateConfidence(String name, String ext, String mimeType, String category) {
        return switch (category) {
            case "deliverable" -> Set.of("zip","tar","gz","7z","rar","tgz").contains(ext) ? 97 : 83;
            case "system"      -> Set.of("java","py","kt","go","rs","cpp","c","h","hpp","cs",
                    "json","yaml","yml","xml","css","html","ts","tsx","js","jsx","mjs","cjs",
                    "sh","sql").contains(ext) ? 94 : 79;
            case "visual"      -> Set.of("png","jpg","jpeg","gif","webp","svg","fig","sketch","psd","ai").contains(ext) ? 95 : 81;
            case "document"    -> Set.of("pdf","md","txt","docx","pptx","key").contains(ext) ? 91 : 73;
            default            -> 70;
        };
    }

    String generateReasoning(String name, String ext, String category) {
        return switch (category) {
            case "system"      -> "." + ext + " files are classified as System because they contain code, configuration, or implementation details.";
            case "visual"      -> "." + ext + " files are classified as Visual because they are image, video, or design assets.";
            case "document"    -> "." + ext + " files are classified as Document because they contain notes, research, or planning material.";
            case "deliverable" -> "." + ext + " files are classified as Deliverable because they represent final outputs or handoff artifacts.";
            default            -> "This file was classified from its filename and extension.";
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
            "This classification contains %d system files, %d visual files, %d document files, and %d deliverables. " +
            "You can drag files to correct any category.",
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
