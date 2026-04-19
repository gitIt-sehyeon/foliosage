# FolioSage Plan 2: Core Features (VaultSage Integration)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement portfolio CRUD, VaultSage file upload with SHA-256 hashing, Smart Organizer pipeline (generate → apply → materialize), PNG preview, and the portfolio management + gallery frontend.

**Architecture:** `VaultSageService` wraps all VaultSage API calls via WebClient. `PortfolioService` orchestrates portfolio CRUD. `OrganizeService` runs the async Smart Organizer pipeline. Files are stored in VaultSage (no S3 needed). The frontend polls organize status and renders the gallery using VaultSage PNG previews.

**Tech Stack:** Spring Boot, Spring WebClient, Spring @Async, Next.js, Axios polling, shadcn/ui

**Prerequisite:** Plan 1 complete, tests passing.

---

## File Structure (additions)

### Backend
```
src/main/java/com/foliosage/
  repository/
    PortfolioRepository.java
    PortfolioFileRepository.java
    CertificateRepository.java
  dto/portfolio/
    CreatePortfolioRequest.java
    PortfolioResponse.java
    PortfolioListItem.java
    FileUploadResponse.java
    OrganizeStatusResponse.java
  service/
    VaultSageService.java
    PortfolioService.java
    OrganizeService.java
  controller/
    PortfolioController.java
```

### Frontend
```
app/
  portfolios/
    new/page.tsx
    [id]/page.tsx
components/
  FileUploadZone.tsx
  FileGallery.tsx
  OrganizeStatus.tsx
```

---

## Task 1: VaultSage Service

**Files:**
- Create: `src/main/java/com/foliosage/service/VaultSageService.java`
- Test: `src/test/java/com/foliosage/service/VaultSageServiceTest.java`

- [ ] **Step 1: Write failing test**

```java
package com.foliosage.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class VaultSageServiceTest {

    @Test
    void parseFileId_extractsIdFromUploadResponse() {
        String json = """
            {"id": "file-abc123", "name": "design.pdf", "size": 1024}
            """;
        VaultSageService service = new VaultSageService(null);
        String fileId = service.extractFileId(json);
        assertThat(fileId).isEqualTo("file-abc123");
    }

    @Test
    void parseOrganizerId_extractsIdFromCreateResponse() {
        String json = """
            {"id": "org-xyz789", "name": "My Portfolio"}
            """;
        VaultSageService service = new VaultSageService(null);
        String orgId = service.extractId(json);
        assertThat(orgId).isEqualTo("org-xyz789");
    }
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
./gradlew test --tests "*.VaultSageServiceTest"
```

Expected: FAIL — `VaultSageService` not found (compilation error)

- [ ] **Step 3: Create `VaultSageService.java`**

```java
package com.foliosage.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service @Slf4j @RequiredArgsConstructor
public class VaultSageService {

    private final WebClient vaultSageClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Files ──────────────────────────────────────────────────────────

    public String uploadFile(byte[] bytes, String filename, String contentType) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new ByteArrayResource(bytes) {
            @Override public String getFilename() { return filename; }
        }).contentType(MediaType.parseMediaType(contentType));

        String response = vaultSageClient.post()
                .uri("/api/v1/files/")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractFileId(response);
    }

    public String getProcessingStatus(String fileId) {
        String response = vaultSageClient.post()
                .uri("/api/v1/files/processing-status")
                .bodyValue(Map.of("file_ids", new String[]{fileId}))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.isArray() ? root : root.path("items");
            for (JsonNode item : items) {
                if (fileId.equals(item.path("id").asText()))
                    return item.path("status").asText("processing");
            }
            return "processing";
        } catch (Exception e) { return "processing"; }
    }

    public void requestPngPreview(String fileId) {
        vaultSageClient.post()
                .uri("/api/v1/files/png-preview-reprocess/{id}", fileId)
                .retrieve()
                .bodyToMono(String.class)
                .subscribe();
    }

    public byte[] downloadPngPreview(String fileId) {
        return vaultSageClient.get()
                .uri("/api/v1/files/png-preview-download/{id}", fileId)
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    // ── Smart Organizers ───────────────────────────────────────────────

    public String createOrganizer(String name) {
        String response = vaultSageClient.post()
                .uri("/api/v1/smart-organizers/")
                .bodyValue(Map.of("name", name))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractId(response);
    }

    public void generateTree(String organizerId) {
        vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{id}/generate", organizerId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public String getGenerateStatus(String organizerId) {
        String response = vaultSageClient.get()
                .uri("/api/v1/smart-organizers/{id}/generate/status", organizerId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractStatus(response);
    }

    public void applyOrganizer(String organizerId) {
        vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{id}/apply", organizerId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public String getApplyProgress(String organizerId) {
        String response = vaultSageClient.get()
                .uri("/api/v1/smart-organizers/{id}/apply/progress", organizerId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractStatus(response);
    }

    public void materialize(String organizerId) {
        vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{id}/materialize", organizerId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public String getMaterializeStatus(String organizerId) {
        String response = vaultSageClient.get()
                .uri("/api/v1/smart-organizers/{id}/materialize/status", organizerId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractStatus(response);
    }

    public String getTree(String organizerId) {
        return vaultSageClient.get()
                .uri("/api/v1/smart-organizers/{id}/tree", organizerId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    // ── Share ──────────────────────────────────────────────────────────

    public Map<String, String> createShare(String[] fileIds) {
        String response = vaultSageClient.post()
                .uri("/api/v1/share/")
                .bodyValue(Map.of("file_ids", fileIds))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        try {
            JsonNode root = objectMapper.readTree(response);
            return Map.of(
                "shareId",   root.path("id").asText(""),
                "shareCode", root.path("code").asText(root.path("share_code").asText(""))
            );
        } catch (Exception e) { return Map.of("shareId", "", "shareCode", ""); }
    }

    public String getAccessLogs(String shareId) {
        return vaultSageClient.get()
                .uri("/api/v1/share/access-logs/{id}", shareId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    // ── Chat ───────────────────────────────────────────────────────────

    public String publicChat(String shareCode, String message, String conversationId) {
        Map<String, Object> body = conversationId != null
                ? Map.of("share_code", shareCode, "message", message, "conversation_id", conversationId)
                : Map.of("share_code", shareCode, "message", message);
        return vaultSageClient.post()
                .uri("/api/v1/chat/public")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public String getPublicChatHistory(String shareCode) {
        return vaultSageClient.get()
                .uri(u -> u.path("/api/v1/chat/public/history")
                        .queryParam("share_code", shareCode).build())
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    // ── Parsers ────────────────────────────────────────────────────────

    public String extractFileId(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.isArray() ? root.get(0) : root;
            return items.path("id").asText();
        } catch (Exception e) { throw new RuntimeException("Failed to parse file ID", e); }
    }

    public String extractId(String json) {
        try { return objectMapper.readTree(json).path("id").asText(); }
        catch (Exception e) { throw new RuntimeException("Failed to parse ID", e); }
    }

    private String extractStatus(String json) {
        try { return objectMapper.readTree(json).path("status").asText("pending"); }
        catch (Exception e) { return "pending"; }
    }
}
```

- [ ] **Step 4: Run tests**

```bash
./gradlew test --tests "*.VaultSageServiceTest"
```

Expected: `2 tests completed, 0 failures`

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: VaultSage service wrapping all API calls"
```

---

## Task 2: Portfolio Backend (CRUD + File Upload)

**Files:**
- Create: `src/main/java/com/foliosage/repository/PortfolioRepository.java`
- Create: `src/main/java/com/foliosage/repository/PortfolioFileRepository.java`
- Create: `src/main/java/com/foliosage/repository/CertificateRepository.java`
- Create: `src/main/java/com/foliosage/dto/portfolio/CreatePortfolioRequest.java`
- Create: `src/main/java/com/foliosage/dto/portfolio/PortfolioResponse.java`
- Create: `src/main/java/com/foliosage/dto/portfolio/PortfolioListItem.java`
- Create: `src/main/java/com/foliosage/dto/portfolio/FileUploadResponse.java`
- Create: `src/main/java/com/foliosage/dto/portfolio/OrganizeStatusResponse.java`
- Create: `src/main/java/com/foliosage/service/PortfolioService.java`
- Create: `src/main/java/com/foliosage/controller/PortfolioController.java`

- [ ] **Step 1: Create repositories**

```java
// PortfolioRepository.java
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
```

```java
// PortfolioFileRepository.java
package com.foliosage.repository;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PortfolioFileRepository extends JpaRepository<PortfolioFile, UUID> {
    List<PortfolioFile> findByPortfolioOrderByCreatedAtAsc(Portfolio portfolio);
}
```

```java
// CertificateRepository.java
package com.foliosage.repository;

import com.foliosage.entity.Certificate;
import com.foliosage.entity.PortfolioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByFile(PortfolioFile file);
}
```

- [ ] **Step 2: Create DTOs**

```java
// CreatePortfolioRequest.java
package com.foliosage.dto.portfolio;
import jakarta.validation.constraints.NotBlank;
public record CreatePortfolioRequest(@NotBlank String title, String description) {}
```

```java
// PortfolioListItem.java
package com.foliosage.dto.portfolio;
import java.time.LocalDateTime;
import java.util.UUID;
public record PortfolioListItem(UUID id, String title, int fileCount,
                                boolean published, LocalDateTime createdAt) {}
```

```java
// FileUploadResponse.java
package com.foliosage.dto.portfolio;
import java.util.UUID;
public record FileUploadResponse(UUID fileId, String name, String fileHash,
                                 String vaultsageFileId) {}
```

```java
// OrganizeStatusResponse.java
package com.foliosage.dto.portfolio;
public record OrganizeStatusResponse(String status, String message) {}
```

```java
// PortfolioResponse.java
package com.foliosage.dto.portfolio;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PortfolioResponse(
        UUID id, String title, String description,
        String organizerId, String shareCode, boolean published,
        LocalDateTime createdAt, List<PortfolioFileDto> files
) {
    public record PortfolioFileDto(UUID id, String name, String vaultsageFileId,
                                   String fileHash, String mimeType, LocalDateTime certifiedAt) {}
}
```

- [ ] **Step 3: Create `PortfolioService.java`**

```java
package com.foliosage.service;

import com.foliosage.dto.portfolio.*;
import com.foliosage.entity.*;
import com.foliosage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
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
                        fileRepository.findByPortfolioOrderByCreatedAtAsc(p).size(),
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
    public FileUploadResponse uploadFile(String userEmail, UUID portfolioId, MultipartFile file) throws Exception {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        byte[] bytes = file.getBytes();
        String hash = sha256(bytes);
        String vaultsageFileId = vaultSageService.uploadFile(
                bytes,
                file.getOriginalFilename(),
                file.getContentType() != null ? file.getContentType() : "application/octet-stream");

        vaultSageService.requestPngPreview(vaultsageFileId);

        PortfolioFile pf = fileRepository.save(PortfolioFile.builder()
                .portfolio(portfolio)
                .vaultsageFileId(vaultsageFileId)
                .name(file.getOriginalFilename())
                .fileHash(hash)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .certifiedAt(LocalDateTime.now())
                .build());

        certificateRepository.save(Certificate.builder()
                .file(pf).issuedAt(LocalDateTime.now()).build());

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private PortfolioResponse toResponse(Portfolio p, List<PortfolioResponse.PortfolioFileDto> files) {
        return new PortfolioResponse(p.getId(), p.getTitle(), p.getDescription(),
                p.getOrganizerId(), p.getShareCode(), p.isPublished(), p.getCreatedAt(), files);
    }
}
```

- [ ] **Step 4: Create `PortfolioController.java`**

```java
package com.foliosage.controller;

import com.foliosage.dto.portfolio.*;
import com.foliosage.service.OrganizeService;
import com.foliosage.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/portfolios") @RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final OrganizeService organizeService;

    @PostMapping
    public PortfolioResponse create(@AuthenticationPrincipal UserDetails user,
                                    @Valid @RequestBody CreatePortfolioRequest req) {
        return portfolioService.create(user.getUsername(), req);
    }

    @GetMapping
    public List<PortfolioListItem> list(@AuthenticationPrincipal UserDetails user) {
        return portfolioService.list(user.getUsername());
    }

    @GetMapping("/{id}")
    public PortfolioResponse get(@AuthenticationPrincipal UserDetails user,
                                 @PathVariable UUID id) {
        return portfolioService.get(user.getUsername(), id);
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
        portfolioService.delete(user.getUsername(), id);
    }

    @PostMapping(value = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FileUploadResponse uploadFile(@AuthenticationPrincipal UserDetails user,
                                         @PathVariable UUID id,
                                         @RequestParam MultipartFile file) throws Exception {
        return portfolioService.uploadFile(user.getUsername(), id, file);
    }

    @PostMapping("/{id}/organize")
    public OrganizeStatusResponse startOrganize(@AuthenticationPrincipal UserDetails user,
                                                @PathVariable UUID id) {
        organizeService.startAsync(user.getUsername(), id);
        return new OrganizeStatusResponse("started", "AI organization started");
    }

    @GetMapping("/{id}/organize/status")
    public OrganizeStatusResponse organizeStatus(@AuthenticationPrincipal UserDetails user,
                                                 @PathVariable UUID id) {
        return organizeService.getStatus(user.getUsername(), id);
    }
}
```

- [ ] **Step 5: Compile**

```bash
./gradlew compileJava
```

Expected: `BUILD SUCCESSFUL` (OrganizeService missing — OK, next task)

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: portfolio CRUD and file upload endpoints"
```

---

## Task 3: Smart Organizer Pipeline (Async)

**Files:**
- Create: `src/main/java/com/foliosage/service/OrganizeService.java`

- [ ] **Step 1: Create `OrganizeService.java`**

```java
package com.foliosage.service;

import com.foliosage.dto.portfolio.OrganizeStatusResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service @Slf4j @RequiredArgsConstructor
public class OrganizeService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final VaultSageService vaultSageService;

    // In-memory status store keyed by portfolioId
    private final Map<UUID, String> statusMap = new ConcurrentHashMap<>();

    public void startAsync(String userEmail, UUID portfolioId) {
        getPortfolioForUser(userEmail, portfolioId);
        statusMap.put(portfolioId, "generating");
        runPipeline(portfolioId);
    }

    @Async
    public void runPipeline(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow();
        String orgId = portfolio.getOrganizerId();
        try {
            // Step 1: generate
            statusMap.put(portfolioId, "generating");
            vaultSageService.generateTree(orgId);
            pollUntilDone(() -> vaultSageService.getGenerateStatus(orgId), "generating", portfolioId);

            // Step 2: apply
            statusMap.put(portfolioId, "applying");
            vaultSageService.applyOrganizer(orgId);
            pollUntilDone(() -> vaultSageService.getApplyProgress(orgId), "applying", portfolioId);

            // Step 3: materialize
            statusMap.put(portfolioId, "materializing");
            vaultSageService.materialize(orgId);
            pollUntilDone(() -> vaultSageService.getMaterializeStatus(orgId), "materializing", portfolioId);

            statusMap.put(portfolioId, "done");
        } catch (Exception e) {
            log.error("Organize pipeline failed for portfolio={}", portfolioId, e);
            statusMap.put(portfolioId, "failed");
        }
    }

    public OrganizeStatusResponse getStatus(String userEmail, UUID portfolioId) {
        getPortfolioForUser(userEmail, portfolioId);
        String status = statusMap.getOrDefault(portfolioId, "idle");
        String message = switch (status) {
            case "generating"    -> "AI is analyzing your files...";
            case "applying"      -> "Applying project structure...";
            case "materializing" -> "Finalizing organization...";
            case "done"          -> "Organization complete!";
            case "failed"        -> "Organization failed. Please retry.";
            default              -> "Not started";
        };
        return new OrganizeStatusResponse(status, message);
    }

    private void pollUntilDone(java.util.function.Supplier<String> statusFn,
                               String currentStep, UUID portfolioId) throws InterruptedException {
        int maxAttempts = 60;
        for (int i = 0; i < maxAttempts; i++) {
            String s = statusFn.get();
            if ("done".equals(s) || "completed".equals(s) || "success".equals(s)) return;
            if ("failed".equals(s) || "error".equals(s))
                throw new RuntimeException("Step " + currentStep + " failed");
            Thread.sleep(3000);
        }
        throw new RuntimeException("Timed out waiting for " + currentStep);
    }

    private Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!p.getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        return p;
    }
}
```

- [ ] **Step 2: Compile**

```bash
./gradlew compileJava
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/foliosage/service/OrganizeService.java
git commit -m "feat: async Smart Organizer pipeline"
```

---

## Task 4: Frontend — Portfolio Management Pages

**Files:**
- Create: `foliosage-frontend/components/FileUploadZone.tsx`
- Create: `foliosage-frontend/components/FileGallery.tsx`
- Create: `foliosage-frontend/components/OrganizeStatus.tsx`
- Create: `foliosage-frontend/app/portfolios/new/page.tsx`
- Create: `foliosage-frontend/app/portfolios/[id]/page.tsx`
- Modify: `foliosage-frontend/app/dashboard/page.tsx`

- [ ] **Step 1: Create `components/FileUploadZone.tsx`**

```typescript
'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface Props {
  portfolioId: string
  onUploaded: (file: any) => void
}

export default function FileUploadZone({ portfolioId, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        const { data } = await api.post(`/api/portfolios/${portfolioId}/files`, form)
        onUploaded(data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Upload failed.')
    } finally { setUploading(false) }
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <div className="text-4xl mb-3">📁</div>
        {uploading
          ? <p className="text-purple-600 font-medium">Uploading...</p>
          : <p className="text-slate-500">Drop files here or click to upload<br /><span className="text-sm">Any file type supported</span></p>
        }
        <input ref={fileRef} type="file" multiple className="hidden"
               onChange={e => handleFiles(e.target.files)} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/OrganizeStatus.tsx`**

```typescript
interface Props { status: string; message: string; onRetry?: () => void }

const statusConfig: Record<string, { color: string; icon: string }> = {
  idle:          { color: 'bg-slate-100 text-slate-600',   icon: '⏸️' },
  generating:    { color: 'bg-blue-50 text-blue-700',      icon: '🤖' },
  applying:      { color: 'bg-indigo-50 text-indigo-700',  icon: '⚙️' },
  materializing: { color: 'bg-purple-50 text-purple-700',  icon: '🔨' },
  done:          { color: 'bg-green-50 text-green-700',    icon: '✅' },
  failed:        { color: 'bg-red-50 text-red-700',        icon: '❌' },
}

export default function OrganizeStatus({ status, message, onRetry }: Props) {
  const cfg = statusConfig[status] ?? statusConfig.idle
  const isRunning = ['generating', 'applying', 'materializing'].includes(status)

  return (
    <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${cfg.color}`}>
      <span className="text-xl">{cfg.icon}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
        {isRunning && (
          <div className="mt-1 h-1 w-full bg-white rounded overflow-hidden">
            <div className="h-1 bg-current rounded animate-pulse w-2/3" />
          </div>
        )}
      </div>
      {status === 'failed' && onRetry && (
        <button onClick={onRetry} className="text-sm underline">Retry</button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/FileGallery.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface FileItem {
  id: string
  name: string
  vaultsageFileId: string
  fileHash: string
  mimeType: string
  certifiedAt: string
}

interface Props {
  files: FileItem[]
  apiUrl: string
  token?: string
}

function FilePreview({ file, apiUrl, token }: { file: FileItem; apiUrl: string; token?: string }) {
  const [imgError, setImgError] = useState(false)
  const previewUrl = `${apiUrl}/api/portfolios/preview/${file.vaultsageFileId}`

  const fileIcon = (mime: string) => {
    if (mime?.includes('image')) return '🖼️'
    if (mime?.includes('pdf')) return '📄'
    if (mime?.includes('video')) return '🎬'
    if (mime?.includes('audio')) return '🎵'
    if (mime?.includes('zip') || mime?.includes('archive')) return '📦'
    return '📁'
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-5xl">{fileIcon(file.mimeType)}</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-400 mt-1 font-mono truncate" title={file.fileHash}>
          {file.fileHash.slice(0, 16)}...
        </p>
        <p className="text-xs text-slate-400">
          {new Date(file.certifiedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export default function FileGallery({ files, apiUrl, token }: Props) {
  if (files.length === 0)
    return <p className="text-slate-400 text-center py-8">No files yet.</p>

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map(f => <FilePreview key={f.id} file={f} apiUrl={apiUrl} token={token} />)}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/portfolios/new/page.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

export default function NewPortfolioPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!isLoggedIn()) router.push('/login') }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/portfolios', form)
      router.push(`/portfolios/${data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create portfolio.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <Link href="/dashboard" className="text-xl font-bold text-purple-600">FolioSage</Link>
        <Link href="/dashboard"><Button variant="ghost">← Dashboard</Button></Link>
      </nav>
      <div className="max-w-xl mx-auto px-4 py-10">
        <Card>
          <CardHeader><CardTitle>Create New Portfolio</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Portfolio Title</Label>
                <Input value={form.title}
                       onChange={e => setForm({...form, title: e.target.value})}
                       placeholder="e.g. UI/UX Design Work 2026"
                       required />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input value={form.description}
                       onChange={e => setForm({...form, description: e.target.value})}
                       placeholder="Brief description of this portfolio" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? 'Creating...' : 'Create Portfolio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/portfolios/[id]/page.tsx`**

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FileUploadZone from '@/components/FileUploadZone'
import FileGallery from '@/components/FileGallery'
import OrganizeStatus from '@/components/OrganizeStatus'
import api from '@/lib/api'

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [organizeStatus, setOrganizeStatus] = useState({ status: 'idle', message: 'Not started' })
  const [shareUrl, setShareUrl] = useState('')
  const [publishing, setPublishing] = useState(false)

  const loadPortfolio = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/portfolios/${id}`)
      setPortfolio(data)
    } catch { router.push('/dashboard') }
  }, [id, router])

  const pollOrganizeStatus = useCallback(async () => {
    const { data } = await api.get(`/api/portfolios/${id}/organize/status`)
    setOrganizeStatus(data)
    if (['generating','applying','materializing'].includes(data.status)) {
      setTimeout(pollOrganizeStatus, 3000)
    }
  }, [id])

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    loadPortfolio()
  }, [loadPortfolio, router])

  const startOrganize = async () => {
    await api.post(`/api/portfolios/${id}/organize`)
    pollOrganizeStatus()
  }

  const publish = async () => {
    setPublishing(true)
    try {
      const { data } = await api.post(`/api/portfolios/${id}/publish`)
      setShareUrl(data.shareUrl)
      loadPortfolio()
    } finally { setPublishing(false) }
  }

  if (!portfolio) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <Link href="/dashboard" className="text-xl font-bold text-purple-600">FolioSage</Link>
        <div className="flex gap-2">
          {portfolio.shareCode && (
            <Link href={`/p/${portfolio.shareCode}`} target="_blank">
              <Button variant="outline" size="sm">View Public →</Button>
            </Link>
          )}
          <Link href="/dashboard"><Button variant="ghost" size="sm">← Dashboard</Button></Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{portfolio.title}</h1>
            {portfolio.description && <p className="text-slate-500 mt-1">{portfolio.description}</p>}
          </div>
          <Badge variant={portfolio.published ? 'default' : 'secondary'}>
            {portfolio.published ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* Upload */}
        <section>
          <h2 className="font-semibold text-lg mb-3">Upload Files</h2>
          <FileUploadZone portfolioId={id} onUploaded={() => loadPortfolio()} />
        </section>

        {/* AI Organize */}
        {portfolio.files?.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">AI Organization</h2>
              {organizeStatus.status === 'idle' || organizeStatus.status === 'failed' ? (
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={startOrganize}>
                  🤖 Start AI Organize
                </Button>
              ) : null}
            </div>
            <OrganizeStatus
              status={organizeStatus.status}
              message={organizeStatus.message}
              onRetry={startOrganize}
            />
          </section>
        )}

        {/* Gallery */}
        {portfolio.files?.length > 0 && (
          <section>
            <h2 className="font-semibold text-lg mb-3">
              Files ({portfolio.files.length})
            </h2>
            <FileGallery
              files={portfolio.files}
              apiUrl={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}
            />
          </section>
        )}

        {/* Publish */}
        {portfolio.files?.length > 0 && (
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-2">Share Your Portfolio</h2>
            {portfolio.shareCode ? (
              <div>
                <p className="text-sm text-slate-500 mb-2">Public link:</p>
                <div className="flex gap-2 items-center">
                  <code className="bg-slate-100 px-3 py-2 rounded text-sm flex-1">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/p/{portfolio.shareCode}
                  </code>
                  <Button size="sm" variant="outline"
                          onClick={() => navigator.clipboard.writeText(
                            `${window.location.origin}/p/${portfolio.shareCode}`)}>
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={publish} disabled={publishing}>
                {publishing ? 'Publishing...' : '🔗 Publish Portfolio'}
              </Button>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Update `app/dashboard/page.tsx` to show portfolio list**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, removeToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [portfolios, setPortfolios] = useState<any[]>([])

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    api.get('/api/portfolios').then(r => setPortfolios(r.data))
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <span className="text-xl font-bold text-purple-600">FolioSage</span>
        <div className="flex gap-3">
          <Link href="/portfolios/new">
            <Button className="bg-purple-600 hover:bg-purple-700">+ New Portfolio</Button>
          </Link>
          <Button variant="ghost" onClick={() => { removeToken(); router.push('/login') }}>Logout</Button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Portfolios</h1>
        {portfolios.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🎨</p>
            <p className="text-slate-500 mb-4">No portfolios yet.</p>
            <Link href="/portfolios/new">
              <Button className="bg-purple-600 hover:bg-purple-700">Create your first portfolio</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((p: any) => (
              <Link key={p.id} href={`/portfolios/${p.id}`}>
                <div className="bg-white rounded-xl border p-5 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800">{p.title}</h3>
                    <Badge variant={p.published ? 'default' : 'secondary'}>
                      {p.published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{p.fileCount} files</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Add PNG preview proxy endpoint to backend**

Add to `PortfolioController.java`:

```java
@GetMapping("/preview/{vaultsageFileId}")
public ResponseEntity<byte[]> preview(@PathVariable String vaultsageFileId) {
    try {
        byte[] bytes = vaultSageService.downloadPngPreview(vaultsageFileId);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                .body(bytes);
    } catch (Exception e) {
        return ResponseEntity.notFound().build();
    }
}
```

Add import to `PortfolioController.java`:
```java
import org.springframework.http.ResponseEntity;
import com.foliosage.service.VaultSageService;
```

Add field:
```java
private final VaultSageService vaultSageService;
```

- [ ] **Step 8: Start both servers and verify end-to-end**

```bash
# Terminal 1
cd foliosage-backend && VAULTSAGE_API_KEY=your-key ./gradlew bootRun

# Terminal 2
cd foliosage-frontend && npm run dev
```

1. Log in → dashboard
2. Create a new portfolio
3. Upload a file → verify it appears in gallery
4. Click "Start AI Organize" → status updates every 3 seconds
5. When done, status shows "Organization complete!"

- [ ] **Step 9: Commit**

```bash
cd foliosage-frontend && git add . && git commit -m "feat: portfolio management and file gallery"
cd foliosage-backend && git add . && git commit -m "feat: file upload and organize pipeline"
```

---

## Task 5: Google OAuth Login

**Context:** 기존 이메일/비밀번호 JWT 인증에 Google OAuth2 로그인을 추가한다. 백엔드에서 Google 콜백 처리 후 기존 JWT를 발급하고, 프론트엔드 로그인 페이지에 Google 로그인 버튼을 추가한다.

**Files:**
- Modify: `foliosage-backend/build.gradle` — OAuth2 client dependency 추가
- Modify: `foliosage-backend/src/main/resources/application.yml` — Google OAuth2 설정
- Create: `foliosage-backend/src/main/java/com/foliosage/security/OAuth2SuccessHandler.java`
- Modify: `foliosage-backend/src/main/java/com/foliosage/config/SecurityConfig.java` — OAuth2 로그인 활성화
- Modify: `foliosage-backend/src/main/java/com/foliosage/service/UserService.java` — Google 계정 자동 가입 처리
- Modify: `foliosage-frontend/app/login/page.tsx` — Google 로그인 버튼 추가
- Modify: `foliosage-frontend/app/register/page.tsx` — Google 로그인 버튼 추가

**Architecture:**
- 백엔드: `spring-boot-starter-oauth2-client`로 Google 콜백 수신 → `OAuth2SuccessHandler`에서 DB에 유저 upsert → 기존 `JwtService`로 JWT 발급 → 프론트엔드로 redirect (쿼리스트링에 token 포함)
- 프론트엔드: `/oauth2/authorization/google` 로 리다이렉트 → 백엔드 콜백 완료 후 `/oauth-callback?token=...` 수신 → `setToken()` 저장 → `/dashboard`로 이동

- [ ] **Step 1: build.gradle — OAuth2 dependency 추가**

```groovy
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
```

- [ ] **Step 2: application.yml — Google OAuth2 설정**

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
            redirect-uri: "{baseUrl}/login/oauth2/code/google"
```

환경 변수 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`은 Google Cloud Console에서 발급받아 설정한다.

- [ ] **Step 3: `OAuth2SuccessHandler.java` 작성**

```java
package com.foliosage.security;

import com.foliosage.entity.User;
import com.foliosage.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name  = oauth2User.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .name(name)
                        .password("")   // OAuth 유저는 비밀번호 없음
                        .build())
        );

        String token = jwtService.generateToken(user.getEmail());
        getRedirectStrategy().sendRedirect(request, response,
                frontendUrl + "/oauth-callback?token=" + token);
    }
}
```

- [ ] **Step 4: `SecurityConfig.java` 수정 — OAuth2 로그인 활성화**

기존 `SecurityConfig`에 아래 내용을 추가한다:

```java
// import 추가
import com.foliosage.security.OAuth2SuccessHandler;

// 필드 추가
private final OAuth2SuccessHandler oAuth2SuccessHandler;

// http 설정 체인에 추가 (.formLogin().disable() 이후)
.oauth2Login(oauth2 -> oauth2
    .successHandler(oAuth2SuccessHandler)
)
```

- [ ] **Step 5: 프론트엔드 — `/oauth-callback` 페이지 생성**

`foliosage-frontend/app/oauth-callback/page.tsx`:

```typescript
'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/auth'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setToken(token)
      router.replace('/dashboard')
    } else {
      router.replace('/login?error=oauth_failed')
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">로그인 처리 중...</p>
    </div>
  )
}
```

- [ ] **Step 6: 로그인/회원가입 페이지에 Google 버튼 추가**

`app/login/page.tsx`와 `app/register/page.tsx`의 폼 하단에 추가:

```typescript
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-slate-200" />
  </div>
  <div className="relative flex justify-center text-xs text-slate-400">
    <span className="bg-white px-2">또는</span>
  </div>
</div>
<Button
  type="button"
  variant="outline"
  className="w-full flex items-center gap-2"
  onClick={() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/oauth2/authorization/google`
  }}
>
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Google로 계속하기
</Button>
```

- [ ] **Step 7: 환경 변수 확인 및 통합 테스트**

1. Google Cloud Console에서 OAuth2 클라이언트 ID/Secret 발급
2. 승인된 리다이렉트 URI에 `http://localhost:8080/login/oauth2/code/google` 추가
3. 백엔드 실행 시 환경변수 설정:
   ```bash
   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... ./gradlew bootRun
   ```
4. 로그인 페이지 → "Google로 계속하기" 클릭 → Google 계정 선택 → 대시보드 진입 확인

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: Google OAuth2 login with JWT handoff"
```

---

## Plan 2 Complete

- ✅ VaultSageService — all API calls wrapped (files, organizers, share, chat)
- ✅ Portfolio CRUD (create, list, get, delete)
- ✅ File upload → VaultSage → SHA-256 hash → certificate record
- ✅ PNG preview proxy endpoint
- ✅ Async Smart Organizer pipeline (generate → apply → materialize)
- ✅ Frontend: portfolio creation, file upload zone, gallery, organize status
- ✅ Google OAuth2 로그인 (Google → JWT → 기존 인증 흐름 통합)

**Next:** Plan 3 — Public portfolio page (gallery + chat), certificates PDF, publish flow, visitor analytics, deployment.
