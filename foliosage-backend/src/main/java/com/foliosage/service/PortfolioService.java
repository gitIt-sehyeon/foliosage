package com.foliosage.service;

import com.foliosage.dto.portfolio.*;
import com.foliosage.entity.*;
import com.foliosage.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Slf4j @Service @RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final VaultSageService vaultSageService;
    private final PortfolioStoryRepository storyRepository;
    private final PortfolioDefenseSessionRepository defenseSessionRepository;
    private final PortfolioStoryService portfolioStoryService;

    @Transactional
    public PortfolioResponse create(String userEmail, CreatePortfolioRequest req) {
        User user = getUser(userEmail);
        String directoryId = vaultSageService.createDirectory(req.title());
        String organizerId = vaultSageService.createOrganizer(req.title(), directoryId);
        Portfolio portfolio = portfolioRepository.save(Portfolio.builder()
                .user(user).title(req.title()).description(req.description())
                .organizerId(organizerId).directoryId(directoryId).build());
        return toResponse(portfolio, List.of());
    }

    @Transactional(readOnly = true)
    public List<PortfolioListItem> list(String userEmail) {
        User user = getUser(userEmail);
        return portfolioRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(p -> new PortfolioListItem(p.getId(), p.getTitle(),
                        (int) fileRepository.countByPortfolio(p),
                        p.isPublished(), p.getCreatedAt(),
                        storyRepository.findByPortfolio(p)
                                .map(story -> "ready".equals(story.getStatus()) && story.getSummary() != null && !story.getSummary().isBlank())
                                .orElse(false),
                        defenseSessionRepository.findFirstByPortfolioAndStatusOrderByCompletedAtDesc(p, "completed").isPresent()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioResponse get(String userEmail, UUID portfolioId) {
        Portfolio p = getPortfolioForUser(userEmail, portfolioId);
        List<PortfolioResponse.PortfolioFileDto> files = fileRepository
                .findByPortfolioOrderByCreatedAtAsc(p).stream()
                .map(f -> new PortfolioResponse.PortfolioFileDto(
                        f.getId(), f.getName(), f.getVaultsageFileId(),
                        f.getFileHash(), f.getMimeType(), f.getCertifiedAt(),
                        f.getDescription()))
                .toList();
        return toResponse(p, files);
    }

    @Transactional
    public FileUploadResponse uploadFile(String userEmail, UUID portfolioId, MultipartFile file) throws RuntimeException {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        log.info("Uploading file '{}' to portfolio {}", file.getOriginalFilename(), portfolioId);
        byte[] bytes;
        String hash;
        try {
            bytes = file.getBytes();
            hash = sha256(bytes);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read file bytes", e);
        }

        String vaultsageFileId;
        try {
            String contentType = resolveUploadContentType(file.getOriginalFilename(), file.getContentType());
            vaultsageFileId = vaultSageService.uploadFile(
                    bytes,
                    file.getOriginalFilename(),
                    contentType,
                    portfolio.getDirectoryId());
            vaultSageService.requestPngPreview(vaultsageFileId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "File upload to VaultSage failed", e);
        }

        PortfolioFile pf = fileRepository.save(PortfolioFile.builder()
                .portfolio(portfolio)
                .vaultsageFileId(vaultsageFileId)
                .name(file.getOriginalFilename())
                .fileHash(hash)
                .fileSize(file.getSize())
                .mimeType(resolveUploadContentType(file.getOriginalFilename(), file.getContentType()))
                .build());

        certificateRepository.save(Certificate.builder()
                .file(pf).build());

        return new FileUploadResponse(pf.getId(), pf.getName(), hash, vaultsageFileId);
    }

    private String resolveUploadContentType(String filename, String contentType) {
        if (contentType != null
                && !contentType.isBlank()
                && !"application/octet-stream".equalsIgnoreCase(contentType)) {
            return contentType;
        }
        String name = filename != null ? filename.toLowerCase(java.util.Locale.ROOT) : "";
        if (name.endsWith(".pdf")) return "application/pdf";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".gif")) return "image/gif";
        if (name.endsWith(".mp4")) return "video/mp4";
        return contentType != null && !contentType.isBlank() ? contentType : "application/octet-stream";
    }

    @Transactional
    public void delete(String userEmail, UUID portfolioId) {
        Portfolio p = getPortfolioForUser(userEmail, portfolioId);
        portfolioRepository.delete(p);
    }

    @Transactional
    public void deleteFile(String userEmail, UUID portfolioId, UUID fileId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        PortfolioFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getPortfolio().getId().equals(portfolio.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "File does not belong to this portfolio");
        log.info("Deleting file id={} vaultsageFileId={} from portfolio={} by user={}",
                fileId, file.getVaultsageFileId(), portfolioId, userEmail);
        // Best-effort: VaultSage failure is logged inside deleteFile() but does not block DB cleanup
        vaultSageService.deleteFile(file.getVaultsageFileId());
        fileRepository.delete(file);
    }

    @Transactional
    public PortfolioResponse.PortfolioFileDto updateFileDescription(
            String userEmail, UUID portfolioId, UUID fileId, String description) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        PortfolioFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getPortfolio().getId().equals(portfolio.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "File does not belong to this portfolio");
        file.setDescription(description);
        fileRepository.save(file);
        return new PortfolioResponse.PortfolioFileDto(
                file.getId(), file.getName(), file.getVaultsageFileId(),
                file.getFileHash(), file.getMimeType(), file.getCertifiedAt(),
                file.getDescription());
    }

    private String sha256(byte[] bytes) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return HexFormat.of().formatHex(digest.digest(bytes));
    }

    public Portfolio getPortfolioEntity(String userEmail, UUID portfolioId) {
        return getPortfolioForUser(userEmail, portfolioId);
    }

    private Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!p.getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        return p;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + email));
    }

    private PortfolioResponse toResponse(Portfolio p, List<PortfolioResponse.PortfolioFileDto> files) {
        return new PortfolioResponse(p.getId(), p.getTitle(), p.getDescription(),
                p.getOrganizerId(), normalizeShareCode(p.getShareCode()), p.isPublished(), p.getCreatedAt(),
                p.getUser().getName(), p.getViewCount(), files,
                storyRepository.findByPortfolio(p).map(portfolioStoryService::toResponse).orElse(null));
    }

    private static String normalizeShareCode(String shareCode) {
        if (shareCode == null) return null;
        int idx = shareCode.indexOf("code=");
        if (idx >= 0) return shareCode.substring(idx + 5);
        return shareCode;
    }
}
