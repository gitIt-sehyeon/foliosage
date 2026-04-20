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

    @Transactional
    public PortfolioResponse create(String userEmail, CreatePortfolioRequest req) {
        User user = getUser(userEmail);
        String organizerId = vaultSageService.createOrganizer(req.title());
        Portfolio portfolio = portfolioRepository.save(Portfolio.builder()
                .user(user).title(req.title()).description(req.description())
                .organizerId(organizerId).build());
        return toResponse(portfolio, List.of());
    }

    @Transactional(readOnly = true)
    public List<PortfolioListItem> list(String userEmail) {
        User user = getUser(userEmail);
        return portfolioRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(p -> new PortfolioListItem(p.getId(), p.getTitle(),
                        (int) fileRepository.countByPortfolio(p),
                        p.isPublished(), p.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioResponse get(String userEmail, UUID portfolioId) {
        Portfolio p = getPortfolioForUser(userEmail, portfolioId);
        List<PortfolioResponse.PortfolioFileDto> files = fileRepository
                .findByPortfolioOrderByCreatedAtAsc(p).stream()
                .map(f -> new PortfolioResponse.PortfolioFileDto(
                        f.getId(), f.getName(), f.getVaultsageFileId(),
                        f.getFileHash(), f.getMimeType(), f.getCertifiedAt()))
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
            vaultsageFileId = vaultSageService.uploadFile(
                    bytes,
                    file.getOriginalFilename(),
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream");
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
                .mimeType(file.getContentType())
                .build());

        certificateRepository.save(Certificate.builder()
                .file(pf).build());

        return new FileUploadResponse(pf.getId(), pf.getName(), hash, vaultsageFileId);
    }

    @Transactional
    public void delete(String userEmail, UUID portfolioId) {
        Portfolio p = getPortfolioForUser(userEmail, portfolioId);
        portfolioRepository.delete(p);
    }

    private String sha256(byte[] bytes) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return HexFormat.of().formatHex(digest.digest(bytes));
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
                p.getOrganizerId(), p.getShareCode(), p.isPublished(), p.getCreatedAt(), files);
    }
}
