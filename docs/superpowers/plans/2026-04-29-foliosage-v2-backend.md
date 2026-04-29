# FolioSage v2 — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add DB columns, fix AI Organization + PDF viewer bugs, and implement file deletion, file descriptions, visitor stats, and user profile endpoints.

**Architecture:** Flyway migration adds new columns to existing tables. OrganizeService gains file readiness polling and DB-backed status persistence. A new `/raw` endpoint streams actual file bytes (not PNG preview). StatsService tracks views/downloads asynchronously. UserController exposes profile CRUD and a public user lookup.

**Tech Stack:** Java 21, Spring Boot 3.4.4, PostgreSQL, JPA/Hibernate, Flyway, WebClient, JUnit 5 + AssertJ

---

## File Map

| Action | File |
|--------|------|
| Create | `src/main/resources/db/migration/V3__add_v2_features.sql` |
| Modify | `src/main/java/com/foliosage/entity/Portfolio.java` |
| Modify | `src/main/java/com/foliosage/entity/PortfolioFile.java` |
| Modify | `src/main/java/com/foliosage/entity/User.java` |
| Modify | `src/main/java/com/foliosage/service/OrganizeService.java` |
| Modify | `src/main/java/com/foliosage/service/VaultSageService.java` |
| Modify | `src/main/java/com/foliosage/service/PortfolioService.java` |
| Create | `src/main/java/com/foliosage/service/StatsService.java` |
| Modify | `src/main/java/com/foliosage/controller/PortfolioController.java` |
| Modify | `src/main/java/com/foliosage/controller/PublicController.java` |
| Create | `src/main/java/com/foliosage/controller/UserController.java` |
| Create | `src/main/java/com/foliosage/dto/portfolio/FileUpdateRequest.java` |
| Create | `src/main/java/com/foliosage/dto/portfolio/StatsResponse.java` |
| Create | `src/main/java/com/foliosage/dto/user/UserProfileRequest.java` |
| Create | `src/main/java/com/foliosage/dto/user/PublicUserResponse.java` |
| Modify | `src/main/java/com/foliosage/repository/UserRepository.java` |
| Modify | `src/main/java/com/foliosage/repository/PortfolioRepository.java` |
| Modify | `src/main/java/com/foliosage/dto/portfolio/PortfolioResponse.java` |
| Create | `src/test/java/com/foliosage/service/OrganizeServiceTest.java` |
| Create | `src/test/java/com/foliosage/service/StatsServiceTest.java` |
| Create | `src/test/java/com/foliosage/service/PortfolioServiceFileTest.java` |

---

### Task 1: DB Migration

**Files:**
- Create: `src/main/resources/db/migration/V3__add_v2_features.sql`

- [ ] **Step 1: Create migration file**

```sql
-- V3__add_v2_features.sql
ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS organize_status    VARCHAR(20),
    ADD COLUMN IF NOT EXISTS organize_completed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS view_count         INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS download_count     INT NOT NULL DEFAULT 0;

ALTER TABLE portfolio_files
    ADD COLUMN IF NOT EXISTS description VARCHAR(500);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username     VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS location     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS github_url   VARCHAR(255);
```

- [ ] **Step 2: Start the backend and verify migration runs**

```bash
cd foliosage-backend
./gradlew bootRun
```

Expected: Flyway log shows `Migrating schema "public" to version 3 - add v2 features` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/migration/V3__add_v2_features.sql
git commit -m "db: add v2 columns (organize_status, view_count, description, user profile)"
```

---

### Task 2: Entity Updates

**Files:**
- Modify: `src/main/java/com/foliosage/entity/Portfolio.java`
- Modify: `src/main/java/com/foliosage/entity/PortfolioFile.java`
- Modify: `src/main/java/com/foliosage/entity/User.java`

- [ ] **Step 1: Update Portfolio entity**

Add these fields inside the `Portfolio` class (after the `createdAt` field):

```java
@Column(name = "organize_status")
private String organizeStatus;

@Column(name = "organize_completed_at")
private OffsetDateTime organizeCompletedAt;

@Builder.Default
@Column(name = "view_count", nullable = false)
private int viewCount = 0;

@Builder.Default
@Column(name = "download_count", nullable = false)
private int downloadCount = 0;
```

- [ ] **Step 2: Update PortfolioFile entity**

Add after `createdAt` field:

```java
@Column(name = "description")
private String description;
```

- [ ] **Step 3: Update User entity**

Add after `bio` field:

```java
@Column(name = "username", unique = true)
private String username;

@Column(name = "location")
private String location;

@Column(name = "linkedin_url")
private String linkedinUrl;

@Column(name = "github_url")
private String githubUrl;
```

- [ ] **Step 4: Verify app starts with `ddl-auto: validate`**

```bash
./gradlew bootRun
```

Expected: No `SchemaManagementException`. If you see one, check that the column names in `@Column(name=...)` exactly match the SQL migration.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/foliosage/entity/
git commit -m "feat: add v2 fields to Portfolio, PortfolioFile, User entities"
```

---

### Task 3: AI Organization — File Readiness + DB Persistence

**Files:**
- Modify: `src/main/java/com/foliosage/service/OrganizeService.java`
- Create: `src/test/java/com/foliosage/service/OrganizeServiceTest.java`

- [ ] **Step 1: Write failing tests**

Create `src/test/java/com/foliosage/service/OrganizeServiceTest.java`:

```java
package com.foliosage.service;

import com.foliosage.dto.portfolio.OrganizeStatusResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.User;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrganizeServiceTest {

    PortfolioRepository portfolioRepo = mock(PortfolioRepository.class);
    PortfolioFileRepository fileRepo = mock(PortfolioFileRepository.class);
    UserRepository userRepo = mock(UserRepository.class);
    VaultSageService vaultSage = mock(VaultSageService.class);

    OrganizeService service;

    @BeforeEach
    void setUp() {
        service = new OrganizeService(portfolioRepo, fileRepo, userRepo, vaultSage);
        // inject self (normally done by Spring @Lazy)
        service.setSelf(service);
    }

    @Test
    void getStatus_returnsDbStatus_whenNotInMemory() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setOrganizeStatus("done");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));

        OrganizeStatusResponse resp = service.getStatus("user@test.com", id);

        assertThat(resp.status()).isEqualTo("done");
        assertThat(resp.message()).isEqualTo("Organization complete!");
    }

    @Test
    void getStatus_returnsIdle_whenDbStatusIsNull() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setEmail("user@test.com");
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setUser(user);
        p.setOrganizeStatus(null);

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));

        OrganizeStatusResponse resp = service.getStatus("user@test.com", id);

        assertThat(resp.status()).isEqualTo("idle");
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
./gradlew test --tests "com.foliosage.service.OrganizeServiceTest"
```

Expected: compilation error or test failure — `setSelf` doesn't exist yet.

- [ ] **Step 3: Rewrite OrganizeService**

Replace the full content of `OrganizeService.java`:

```java
package com.foliosage.service;

import com.foliosage.dto.portfolio.OrganizeStatusResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service @Slf4j @RequiredArgsConstructor
public class OrganizeService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final UserRepository userRepository;
    private final VaultSageService vaultSageService;

    @Setter
    @Lazy @Autowired
    private OrganizeService self;

    private final Map<UUID, String> statusCache = new ConcurrentHashMap<>();

    public void startAsync(String userEmail, UUID portfolioId) {
        getPortfolioForUser(userEmail, portfolioId);
        persistStatus(portfolioId, "generating");
        self.runPipeline(portfolioId);
    }

    @Async
    public void runPipeline(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow();
        String orgId = portfolio.getOrganizerId();
        try {
            List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);
            List<String> fileIds = files.stream().map(PortfolioFile::getVaultsageFileId).toList();

            persistStatus(portfolioId, "generating");

            if (!fileIds.isEmpty()) {
                waitForFilesReady(fileIds, portfolioId);
                String rootNodeId = vaultSageService.createNode(orgId, portfolio.getTitle());
                vaultSageService.assignFilesToNode(orgId, rootNodeId, fileIds);
            }

            String generateJobId = vaultSageService.generateTree(orgId);
            pollUntilDone(() -> vaultSageService.getGenerateStatus(orgId, generateJobId), "generating", portfolioId);

            persistStatus(portfolioId, "applying");
            String applyJobId = vaultSageService.applyOrganizer(orgId);
            pollUntilDone(() -> vaultSageService.getApplyProgress(orgId, applyJobId), "applying", portfolioId);

            persistStatus(portfolioId, "materializing");
            String materializeJobId = vaultSageService.materialize(orgId);
            pollUntilDone(() -> vaultSageService.getMaterializeStatus(orgId, materializeJobId), "materializing", portfolioId);

            persistStatus(portfolioId, "done");
            log.info("Organize pipeline completed for portfolio={}", portfolioId);
        } catch (Exception e) {
            log.error("Organize pipeline failed at status={} for portfolio={}", statusCache.get(portfolioId), portfolioId, e);
            persistStatus(portfolioId, "failed");
        }
    }

    public OrganizeStatusResponse getStatus(String userEmail, UUID portfolioId) {
        getPortfolioForUser(userEmail, portfolioId);
        // Prefer in-memory cache; fall back to DB (survives server restart)
        String status = statusCache.computeIfAbsent(portfolioId, id ->
                portfolioRepository.findById(id)
                        .map(p -> p.getOrganizeStatus() != null ? p.getOrganizeStatus() : "idle")
                        .orElse("idle"));
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

    private void persistStatus(UUID portfolioId, String status) {
        statusCache.put(portfolioId, status);
        portfolioRepository.findById(portfolioId).ifPresent(p -> {
            p.setOrganizeStatus(status);
            if ("done".equals(status)) p.setOrganizeCompletedAt(OffsetDateTime.now());
            portfolioRepository.save(p);
        });
    }

    private void waitForFilesReady(List<String> fileIds, UUID portfolioId) throws InterruptedException {
        int maxAttempts = 100; // ~5 minutes at 3s interval
        for (int i = 0; i < maxAttempts; i++) {
            boolean allReady = fileIds.stream().allMatch(id -> {
                try {
                    String s = vaultSageService.getProcessingStatus(id);
                    return "completed".equalsIgnoreCase(s) || "success".equalsIgnoreCase(s);
                } catch (Exception e) {
                    log.warn("Could not check processing status for fileId={}", id, e);
                    return false;
                }
            });
            if (allReady) return;
            if (i % 10 == 0) log.debug("Waiting for files to be ready, attempt={}, portfolio={}", i, portfolioId);
            Thread.sleep(3000);
        }
        throw new RuntimeException("Files did not finish processing within timeout");
    }

    private void pollUntilDone(java.util.function.Supplier<String> statusFn,
                               String currentStep, UUID portfolioId) throws InterruptedException {
        int maxAttempts = 200;
        for (int i = 0; i < maxAttempts; i++) {
            String s = statusFn.get();
            if (i % 10 == 0) log.debug("Polling step={} attempt={} status={} portfolio={}", currentStep, i, s, portfolioId);
            if (s == null) { Thread.sleep(3000); continue; }
            if (s.equals("done") || s.equals("completed") || s.equals("success") || s.equals("complete")) return;
            if (s.equals("failed") || s.equals("error") || s.equals("cancelled") || s.equals("canceled"))
                throw new RuntimeException("Step " + currentStep + " failed with status: " + s);
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

- [ ] **Step 4: Run tests**

```bash
./gradlew test --tests "com.foliosage.service.OrganizeServiceTest"
```

Expected: PASS (both tests green).

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/foliosage/service/OrganizeService.java \
        src/test/java/com/foliosage/service/OrganizeServiceTest.java
git commit -m "fix: OrganizeService — file readiness check, DB status persistence, better error logging"
```

---

### Task 4: VaultSageService — downloadFile()

**Files:**
- Modify: `src/main/java/com/foliosage/service/VaultSageService.java`

- [ ] **Step 1: Add `downloadFile` and `deleteFile` methods**

In `VaultSageService.java`, add the following two methods after the `streamPreviewAnonymous` method (in the `── Files ──` section):

```java
public byte[] downloadFile(String fileId) {
    try {
        return vaultSageClient.post()
                .uri("/api/v1/files/download")
                .bodyValue(Map.of("file_ids", List.of(fileId)))
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    } catch (Exception e) {
        log.error("Failed to download file from VaultSage fileId={}", fileId, e);
        return null;
    }
}

public void deleteFile(String fileId) {
    vaultSageClient.post()
            .uri("/api/v1/files/delete")
            .bodyValue(Map.of("file_ids", List.of(fileId)))
            .retrieve()
            .bodyToMono(String.class)
            .block();
}
```

- [ ] **Step 2: Verify compilation**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/foliosage/service/VaultSageService.java
git commit -m "feat: add downloadFile() and deleteFile() to VaultSageService"
```

---

### Task 5: PublicController — /raw Endpoint + /users/{username}

**Files:**
- Modify: `src/main/java/com/foliosage/controller/PublicController.java`
- Modify: `src/main/java/com/foliosage/repository/UserRepository.java`
- Modify: `src/main/java/com/foliosage/repository/PortfolioRepository.java`
- Create: `src/main/java/com/foliosage/dto/user/PublicUserResponse.java`

- [ ] **Step 1: Add `findByUsername` to UserRepository**

```java
Optional<User> findByUsername(String username);
```

- [ ] **Step 2: Add `findByUserAndPublishedTrue` to PortfolioRepository**

```java
List<Portfolio> findByUserAndPublishedTrue(User user);
```

- [ ] **Step 3: Create PublicUserResponse DTO**

Create `src/main/java/com/foliosage/dto/user/PublicUserResponse.java`:

```java
package com.foliosage.dto.user;

import java.util.List;
import java.util.UUID;

public record PublicUserResponse(
        String username,
        String name,
        String bio,
        String location,
        String linkedinUrl,
        String githubUrl,
        int totalViews,
        List<PortfolioSummary> portfolios
) {
    public record PortfolioSummary(
            UUID id,
            String title,
            String description,
            String shareCode,
            int viewCount,
            int fileCount
    ) {}
}
```

- [ ] **Step 4: Add /raw and /users/{username} endpoints to PublicController**

Add these two methods to `PublicController.java` (inject `UserRepository` and `PortfolioRepository` — they're already available, just add `PortfolioRepository` if missing):

First, add `PortfolioRepository portfolioRepository` field if not already present. Then add:

```java
@GetMapping("/{shareCode}/files/{vaultsageFileId}/raw")
public ResponseEntity<byte[]> rawFile(
        @PathVariable String shareCode,
        @PathVariable String vaultsageFileId,
        @RequestParam(defaultValue = "false") boolean download) {
    Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
            .filter(Portfolio::isPublished)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
    PortfolioFile file = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio)
            .stream()
            .filter(f -> f.getVaultsageFileId().equals(vaultsageFileId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

    byte[] bytes = vaultSageService.downloadFile(vaultsageFileId);
    if (bytes == null || bytes.length == 0)
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not available");

    String mimeType = file.getMimeType() != null ? file.getMimeType() : "application/octet-stream";
    String disposition = download
            ? "attachment; filename=\"" + file.getName() + "\""
            : "inline";

    return ResponseEntity.ok()
            .contentType(org.springframework.http.MediaType.parseMediaType(mimeType))
            .header("Content-Disposition", disposition)
            .body(bytes);
}

@GetMapping("/users/{username}")
public PublicUserResponse getPublicUser(@PathVariable String username) {
    com.foliosage.entity.User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    List<com.foliosage.entity.Portfolio> portfolios = portfolioRepository.findByUserAndPublishedTrue(user);

    int totalViews = portfolios.stream().mapToInt(com.foliosage.entity.Portfolio::getViewCount).sum();

    List<com.foliosage.dto.user.PublicUserResponse.PortfolioSummary> summaries = portfolios.stream()
            .map(p -> new com.foliosage.dto.user.PublicUserResponse.PortfolioSummary(
                    p.getId(), p.getTitle(), p.getDescription(),
                    p.getShareCode(), p.getViewCount(),
                    (int) fileRepository.findByPortfolioOrderByCreatedAtAsc(p).stream().count()))
            .toList();

    return new com.foliosage.dto.user.PublicUserResponse(
            user.getUsername(), user.getName(), user.getBio(),
            user.getLocation(), user.getLinkedinUrl(), user.getGithubUrl(),
            totalViews, summaries);
}
```

Also add `import com.foliosage.dto.user.PublicUserResponse;` and inject `UserRepository userRepository` into `PublicController`.

- [ ] **Step 5: Add `/api/public/users/**` to SecurityConfig permit list**

In `SecurityConfig.java`, find the `.requestMatchers` line for `/api/public/**` and confirm it already covers `/api/public/users/**`. If not, add:

```java
.requestMatchers("/api/public/**").permitAll()
```

- [ ] **Step 6: Verify compilation**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/foliosage/controller/PublicController.java \
        src/main/java/com/foliosage/repository/UserRepository.java \
        src/main/java/com/foliosage/repository/PortfolioRepository.java \
        src/main/java/com/foliosage/dto/user/
git commit -m "feat: add /raw file endpoint and /users/{username} public profile endpoint"
```

---

### Task 6: File Deletion

**Files:**
- Modify: `src/main/java/com/foliosage/service/PortfolioService.java`
- Modify: `src/main/java/com/foliosage/controller/PortfolioController.java`
- Create: `src/test/java/com/foliosage/service/PortfolioServiceFileTest.java`

- [ ] **Step 1: Write failing test**

Create `src/test/java/com/foliosage/service/PortfolioServiceFileTest.java`:

```java
package com.foliosage.service;

import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.entity.User;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class PortfolioServiceFileTest {

    PortfolioRepository portfolioRepo = mock(PortfolioRepository.class);
    PortfolioFileRepository fileRepo = mock(PortfolioFileRepository.class);
    VaultSageService vaultSage = mock(VaultSageService.class);

    @Test
    void deleteFile_throws403_whenFileDoesNotBelongToPortfolio() {
        UUID portfolioId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();
        UUID otherPortfolioId = UUID.randomUUID();

        User user = new User(); user.setEmail("user@test.com");
        Portfolio portfolio = new Portfolio(); portfolio.setId(portfolioId); portfolio.setUser(user);
        Portfolio other = new Portfolio(); other.setId(otherPortfolioId); other.setUser(user);
        PortfolioFile file = new PortfolioFile(); file.setId(fileId);
        file.setPortfolio(other); // file belongs to a DIFFERENT portfolio
        file.setVaultsageFileId("vs-id");

        when(portfolioRepo.findById(portfolioId)).thenReturn(Optional.of(portfolio));
        when(fileRepo.findById(fileId)).thenReturn(Optional.of(file));

        PortfolioService service = new PortfolioService(portfolioRepo, fileRepo, null, null, vaultSage, null, null);

        assertThatThrownBy(() -> service.deleteFile("user@test.com", portfolioId, fileId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
./gradlew test --tests "com.foliosage.service.PortfolioServiceFileTest"
```

Expected: compilation error — `deleteFile` not defined yet.

- [ ] **Step 3: Add `deleteFile` to PortfolioService**

In `PortfolioService.java`, add `PortfolioFileRepository fileRepository` and `VaultSageService vaultSageService` to constructor if not already injected, then add:

```java
public void deleteFile(String userEmail, UUID portfolioId, UUID fileId) {
    Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
    PortfolioFile file = fileRepository.findById(fileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
    if (!file.getPortfolio().getId().equals(portfolio.getId()))
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "File does not belong to this portfolio");
    vaultSageService.deleteFile(file.getVaultsageFileId());
    fileRepository.delete(file);
}
```

Note: `getPortfolioForUser` is a private helper that already exists in PortfolioService. If it doesn't exist by that name, add:

```java
private Portfolio getPortfolioForUser(String userEmail, UUID portfolioId) {
    Portfolio p = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
    if (!p.getUser().getEmail().equals(userEmail))
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    return p;
}
```

- [ ] **Step 4: Add DELETE endpoint to PortfolioController**

```java
@DeleteMapping("/{id}/files/{fileId}")
public ResponseEntity<Void> deleteFile(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable UUID id,
        @PathVariable UUID fileId) {
    portfolioService.deleteFile(user.getUsername(), id, fileId);
    return ResponseEntity.noContent().build();
}
```

- [ ] **Step 5: Run tests**

```bash
./gradlew test --tests "com.foliosage.service.PortfolioServiceFileTest"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/foliosage/service/PortfolioService.java \
        src/main/java/com/foliosage/controller/PortfolioController.java \
        src/test/java/com/foliosage/service/PortfolioServiceFileTest.java
git commit -m "feat: file deletion — DELETE /api/portfolios/{id}/files/{fileId}"
```

---

### Task 7: File Description Update

**Files:**
- Create: `src/main/java/com/foliosage/dto/portfolio/FileUpdateRequest.java`
- Modify: `src/main/java/com/foliosage/dto/portfolio/PortfolioResponse.java`
- Modify: `src/main/java/com/foliosage/service/PortfolioService.java`
- Modify: `src/main/java/com/foliosage/controller/PortfolioController.java`

- [ ] **Step 1: Create FileUpdateRequest DTO**

```java
package com.foliosage.dto.portfolio;

import jakarta.validation.constraints.Size;

public record FileUpdateRequest(@Size(max = 500) String description) {}
```

- [ ] **Step 2: Add `description` to PortfolioResponse.PortfolioFileDto**

In `PortfolioResponse.java`, find the `PortfolioFileDto` record and add `String description`:

```java
public record PortfolioFileDto(
        UUID id,
        String name,
        String vaultsageFileId,
        String fileHash,
        String mimeType,
        java.time.OffsetDateTime certifiedAt,
        String description          // ← add this
) {}
```

Then update every place that constructs `PortfolioFileDto` to pass `f.getDescription()` as the last argument. Search for `new PortfolioResponse.PortfolioFileDto(` in the codebase:

```bash
grep -r "new PortfolioResponse.PortfolioFileDto" src/
```

Update each call site to pass `f.getDescription()` as the final argument.

- [ ] **Step 3: Add `updateFileDescription` to PortfolioService**

```java
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
```

- [ ] **Step 4: Add PATCH endpoint to PortfolioController**

```java
@PatchMapping("/{id}/files/{fileId}")
public PortfolioResponse.PortfolioFileDto updateFile(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable UUID id,
        @PathVariable UUID fileId,
        @Valid @RequestBody FileUpdateRequest req) {
    return portfolioService.updateFileDescription(user.getUsername(), id, fileId, req.description());
}
```

- [ ] **Step 5: Verify compilation and run all tests**

```bash
./gradlew test
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/foliosage/dto/portfolio/FileUpdateRequest.java \
        src/main/java/com/foliosage/dto/portfolio/PortfolioResponse.java \
        src/main/java/com/foliosage/service/PortfolioService.java \
        src/main/java/com/foliosage/controller/PortfolioController.java
git commit -m "feat: file description — PATCH /api/portfolios/{id}/files/{fileId}"
```

---

### Task 8: Visitor Statistics

**Files:**
- Create: `src/main/java/com/foliosage/service/StatsService.java`
- Create: `src/main/java/com/foliosage/dto/portfolio/StatsResponse.java`
- Modify: `src/main/java/com/foliosage/controller/PortfolioController.java`
- Modify: `src/main/java/com/foliosage/controller/PublicController.java`
- Create: `src/test/java/com/foliosage/service/StatsServiceTest.java`

- [ ] **Step 1: Create StatsResponse DTO**

```java
package com.foliosage.dto.portfolio;

public record StatsResponse(int viewCount, int downloadCount, int todayViews) {}
```

- [ ] **Step 2: Write failing test**

Create `src/test/java/com/foliosage/service/StatsServiceTest.java`:

```java
package com.foliosage.service;

import com.foliosage.dto.portfolio.StatsResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.repository.PortfolioRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class StatsServiceTest {

    PortfolioRepository portfolioRepo = mock(PortfolioRepository.class);
    VaultSageService vaultSage = mock(VaultSageService.class);

    @Test
    void getStats_returnsTodayViewsZero_whenVaultSageFails() {
        UUID id = UUID.randomUUID();
        Portfolio p = new Portfolio();
        p.setId(id);
        p.setViewCount(10);
        p.setDownloadCount(3);
        p.setVaultsageShareId("share123");

        when(portfolioRepo.findById(id)).thenReturn(Optional.of(p));
        when(vaultSage.getAccessLogs("share123")).thenThrow(new RuntimeException("VaultSage down"));

        StatsService service = new StatsService(portfolioRepo, vaultSage);
        StatsResponse resp = service.getStats(id);

        assertThat(resp.viewCount()).isEqualTo(10);
        assertThat(resp.downloadCount()).isEqualTo(3);
        assertThat(resp.todayViews()).isEqualTo(0); // best-effort, graceful fallback
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

```bash
./gradlew test --tests "com.foliosage.service.StatsServiceTest"
```

Expected: compilation error — `StatsService` not found.

- [ ] **Step 4: Create StatsService**

```java
package com.foliosage.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.portfolio.StatsResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service @Slf4j @RequiredArgsConstructor
public class StatsService {

    private final PortfolioRepository portfolioRepository;
    private final VaultSageService vaultSageService;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public void incrementViewCount(UUID portfolioId) {
        portfolioRepository.findById(portfolioId).ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            portfolioRepository.save(p);
        });
    }

    @Async
    public void incrementDownloadCount(UUID portfolioId) {
        portfolioRepository.findById(portfolioId).ifPresent(p -> {
            p.setDownloadCount(p.getDownloadCount() + 1);
            portfolioRepository.save(p);
        });
    }

    public StatsResponse getStats(UUID portfolioId) {
        Portfolio p = portfolioRepository.findById(portfolioId).orElseThrow();
        int todayViews = 0;
        if (p.getVaultsageShareId() != null) {
            try {
                todayViews = countTodayViews(vaultSageService.getAccessLogs(p.getVaultsageShareId()));
            } catch (Exception e) {
                log.warn("Failed to fetch access logs for portfolio={}", portfolioId, e);
            }
        }
        return new StatsResponse(p.getViewCount(), p.getDownloadCount(), todayViews);
    }

    private int countTodayViews(String logsJson) {
        if (logsJson == null) return 0;
        try {
            String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            JsonNode root = objectMapper.readTree(logsJson);
            JsonNode items = root.isArray() ? root : root.path("data");
            int count = 0;
            for (JsonNode item : items) {
                String ts = item.path("accessed_at").asText(item.path("timestamp").asText(""));
                if (ts.startsWith(today)) count++;
            }
            return count;
        } catch (Exception e) {
            log.warn("Failed to parse access logs JSON", e);
            return 0;
        }
    }
}
```

- [ ] **Step 5: Run test**

```bash
./gradlew test --tests "com.foliosage.service.StatsServiceTest"
```

Expected: PASS.

- [ ] **Step 6: Wire StatsService into PublicController and PortfolioController**

In `PublicController.java`:
- Inject `StatsService statsService` and `PortfolioRepository portfolioRepository` (if not already present)
- In `getPublicPortfolio`, add at the start: `statsService.incrementViewCount(portfolio.getId());`
- In `rawFile`, after successful bytes fetch: `statsService.incrementDownloadCount(portfolio.getId());`

In `PortfolioController.java`:
- Inject `StatsService statsService`
- Add new endpoint:

```java
@GetMapping("/{id}/stats")
public StatsResponse getStats(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
    portfolioService.getPortfolioEntity(user.getUsername(), id); // ownership check
    return statsService.getStats(id);
}
```

- [ ] **Step 7: Run all tests**

```bash
./gradlew test
```

Expected: All PASS.

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/foliosage/service/StatsService.java \
        src/main/java/com/foliosage/dto/portfolio/StatsResponse.java \
        src/main/java/com/foliosage/controller/ \
        src/test/java/com/foliosage/service/StatsServiceTest.java
git commit -m "feat: visitor stats — view/download counting, GET /api/portfolios/{id}/stats"
```

---

### Task 9: User Profile

**Files:**
- Create: `src/main/java/com/foliosage/dto/user/UserProfileRequest.java`
- Create: `src/main/java/com/foliosage/controller/UserController.java`
- Modify: `src/main/java/com/foliosage/config/SecurityConfig.java`

- [ ] **Step 1: Create UserProfileRequest DTO**

```java
package com.foliosage.dto.user;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileRequest(
        @Size(min = 3, max = 50)
        @Pattern(regexp = "^[a-z0-9_-]+$", message = "Username may only contain lowercase letters, digits, hyphens, and underscores")
        String username,

        @Size(max = 300)
        String bio,

        @Size(max = 100)
        String location,

        @Size(max = 255)
        String linkedinUrl,

        @Size(max = 255)
        String githubUrl
) {}
```

- [ ] **Step 2: Create UserController**

```java
package com.foliosage.controller;

import com.foliosage.dto.user.UserProfileRequest;
import com.foliosage.entity.User;
import com.foliosage.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserProfileResponse me(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(), user.getUsername(),
                user.getBio(), user.getLocation(), user.getLinkedinUrl(), user.getGithubUrl());
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<Void> updateProfile(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody UserProfileRequest req) {
        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.username() != null) {
            if (userRepository.findByUsername(req.username()).filter(u -> !u.getId().equals(user.getId())).isPresent())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
            user.setUsername(req.username());
        }
        if (req.bio() != null) user.setBio(req.bio());
        if (req.location() != null) user.setLocation(req.location());
        if (req.linkedinUrl() != null) user.setLinkedinUrl(req.linkedinUrl());
        if (req.githubUrl() != null) user.setGithubUrl(req.githubUrl());
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    public record UserProfileResponse(
            java.util.UUID id, String name, String email, String username,
            String bio, String location, String linkedinUrl, String githubUrl) {}
}
```

- [ ] **Step 3: Add `/api/users/**` to SecurityConfig authenticated routes**

In `SecurityConfig.java`, confirm `/api/users/**` is NOT in the `permitAll()` list (it should require authentication). The default Spring Security behavior requires auth for all routes not explicitly permitted, so this should already be correct. Verify by checking that only these are permitted:

```java
.requestMatchers("/api/auth/**", "/api/public/**", "/login/oauth2/**", "/oauth2/**").permitAll()
```

- [ ] **Step 4: Verify compilation**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 5: Run all tests**

```bash
./gradlew test
```

Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/foliosage/dto/user/ \
        src/main/java/com/foliosage/controller/UserController.java
git commit -m "feat: user profile — GET /api/users/me, PATCH /api/users/me/profile"
```

---

### Task 10: Final Backend Verification

- [ ] **Step 1: Run full test suite**

```bash
./gradlew test
```

Expected: All tests PASS. Note the count — it should be more tests than before.

- [ ] **Step 2: Build the JAR**

```bash
./gradlew bootJar
```

Expected: BUILD SUCCESSFUL, JAR produced in `build/libs/`.

- [ ] **Step 3: Start server and smoke-test key endpoints**

```bash
./gradlew bootRun &
sleep 8

# Public user lookup (should 404 since no user has a username yet)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/public/users/nobody
# Expected: 404

# Stats endpoint (requires auth — should 401 without token)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/portfolios/some-id/stats
# Expected: 401

kill %1
```

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: backend smoke-test fixes" # only if changes were needed
```
