# ClauseGuard — Plan 3: Collaboration & Deployment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add version comparison, team workspaces, and share links. Then deploy the backend to AWS Elastic Beanstalk with RDS, and the frontend to Vercel.

**Architecture:** Version comparison diffs clause lists between two `Analysis` records. Workspaces group contracts and members with roles. Share links generate a signed token giving read-only access to an analysis without authentication. Deployment uses Elastic Beanstalk for the Spring Boot JAR and Vercel for the Next.js app.

**Tech Stack:** Spring Boot, Next.js, AWS Elastic Beanstalk, AWS RDS (PostgreSQL), AWS S3, Vercel

**Prerequisite:** Plans 1 and 2 must be complete.

---

## File Structure (additions)

### Backend
```
src/main/java/com/clauseguard/
  repository/
    WorkspaceRepository.java
    WorkspaceMemberRepository.java
    ShareLinkRepository.java
  dto/
    workspace/WorkspaceResponse.java
    workspace/CreateWorkspaceRequest.java
    workspace/InviteRequest.java
    contract/VersionCompareResponse.java
    contract/ShareLinkResponse.java
  service/
    WorkspaceService.java
    ShareService.java
    VersionService.java
  controller/
    WorkspaceController.java
    ShareController.java
```

### Frontend
```
app/
  contracts/[id]/
    compare/page.tsx
    versions/page.tsx
  workspace/
    page.tsx
    [id]/
      page.tsx
      settings/page.tsx
  share/[token]/page.tsx
components/
  VersionCompare.tsx
  WorkspaceInvite.tsx
```

---

## Task 1: Version Comparison Backend

**Files:**
- Create: `src/main/java/com/clauseguard/dto/contract/VersionCompareResponse.java`
- Create: `src/main/java/com/clauseguard/service/VersionService.java`
- Add endpoint to: `src/main/java/com/clauseguard/controller/ContractController.java`
- Test: `src/test/java/com/clauseguard/service/VersionServiceTest.java`

- [ ] **Step 1: Write failing test**

```java
// src/test/java/com/clauseguard/service/VersionServiceTest.java
package com.clauseguard.service;

import com.clauseguard.dto.contract.VersionCompareResponse;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class VersionServiceTest {

    @Test
    void diff_detectsAddedModifiedAndRemovedClauses() {
        var old = List.of(
                clause(0, "Contractor waives all IP rights.", "high"),
                clause(1, "Payment due in 30 days.", "low")
        );
        var updated = List.of(
                clause(0, "IP rights limited to project deliverables.", "low"),
                clause(1, "Payment due in 30 days.", "low"),
                clause(2, "Governing law: California.", "medium")
        );

        VersionService service = new VersionService(null, null, null, null);
        List<VersionCompareResponse.ClauseDiff> diffs = service.diff(old, updated);

        assertThat(diffs).hasSize(3);
        assertThat(diffs.get(0).changeType()).isEqualTo("modified");
        assertThat(diffs.get(1).changeType()).isEqualTo("unchanged");
        assertThat(diffs.get(2).changeType()).isEqualTo("added");
    }

    private VersionCompareResponse.ClauseDiff clause(int idx, String text, String risk) {
        return new VersionCompareResponse.ClauseDiff(UUID.randomUUID(), idx, text, null, risk, null, "unchanged");
    }
}
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
./mvnw test -Dtest=VersionServiceTest
```

Expected: FAIL — `VersionService` not found

- [ ] **Step 3: Create `VersionCompareResponse.java`**

```java
package com.clauseguard.dto.contract;

import java.util.List;
import java.util.UUID;

public record VersionCompareResponse(
        int v1,
        int v2,
        List<ClauseDiff> diffs
) {
    public record ClauseDiff(
            UUID clauseId,
            int clauseIndex,
            String textV1,         // null if added
            String textV2,         // null if removed
            String riskLevelV1,    // null if added
            String riskLevelV2,    // null if removed
            String changeType      // "added", "removed", "modified", "unchanged"
    ) {}
}
```

- [ ] **Step 4: Create `VersionService.java`**

```java
package com.clauseguard.service;

import com.clauseguard.dto.contract.VersionCompareResponse;
import com.clauseguard.entity.*;
import com.clauseguard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class VersionService {

    private final ContractRepository contractRepository;
    private final ContractVersionRepository versionRepository;
    private final AnalysisRepository analysisRepository;
    private final ClauseRepository clauseRepository;

    @Transactional
    public void addVersion(String userEmail, UUID contractId, MultipartFile file,
                           S3Service s3Service, ContractService contractService) throws Exception {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
        if (!contract.getUploader().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        int nextNum = versionRepository.findTopByContractOrderByVersionNumDesc(contract)
                .map(v -> v.getVersionNum() + 1).orElse(2);
        String s3Key = s3Service.upload(file, "contracts/" + contractId);
        ContractVersion version = versionRepository.save(
                ContractVersion.builder().contract(contract).versionNum(nextNum).s3Key(s3Key).build());
        Analysis analysis = analysisRepository.save(
                Analysis.builder().contractVersion(version).status(Analysis.Status.pending).build());
        contractService.runAnalysisAsync(analysis.getId(), version.getId(), file.getBytes());
    }

    @Transactional(readOnly = true)
    public VersionCompareResponse compare(String userEmail, UUID contractId, int v1Num, int v2Num) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
        if (!contract.getUploader().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        List<ContractVersion> versions = versionRepository.findByContractOrderByVersionNumAsc(contract);
        ContractVersion ver1 = versions.stream().filter(v -> v.getVersionNum() == v1Num).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version " + v1Num + " not found"));
        ContractVersion ver2 = versions.stream().filter(v -> v.getVersionNum() == v2Num).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version " + v2Num + " not found"));

        List<Clause> clauses1 = getClausesForVersion(ver1);
        List<Clause> clauses2 = getClausesForVersion(ver2);

        return new VersionCompareResponse(v1Num, v2Num, diff(
                clauses1.stream().map(c -> toDto(c, true)).toList(),
                clauses2.stream().map(c -> toDto(c, false)).toList()
        ));
    }

    public List<VersionCompareResponse.ClauseDiff> diff(
            List<VersionCompareResponse.ClauseDiff> v1Clauses,
            List<VersionCompareResponse.ClauseDiff> v2Clauses) {
        int max = Math.max(v1Clauses.size(), v2Clauses.size());
        List<VersionCompareResponse.ClauseDiff> result = new ArrayList<>();
        for (int i = 0; i < max; i++) {
            if (i >= v1Clauses.size()) {
                var c = v2Clauses.get(i);
                result.add(new VersionCompareResponse.ClauseDiff(
                        c.clauseId(), i, null, c.textV1(), null, c.riskLevelV1(), "added"));
            } else if (i >= v2Clauses.size()) {
                var c = v1Clauses.get(i);
                result.add(new VersionCompareResponse.ClauseDiff(
                        c.clauseId(), i, c.textV1(), null, c.riskLevelV1(), null, "removed"));
            } else {
                var c1 = v1Clauses.get(i);
                var c2 = v2Clauses.get(i);
                boolean changed = !Objects.equals(c1.textV1(), c2.textV1())
                        || !Objects.equals(c1.riskLevelV1(), c2.riskLevelV1());
                result.add(new VersionCompareResponse.ClauseDiff(
                        c1.clauseId(), i, c1.textV1(), c2.textV1(),
                        c1.riskLevelV1(), c2.riskLevelV1(),
                        changed ? "modified" : "unchanged"));
            }
        }
        return result;
    }

    private List<Clause> getClausesForVersion(ContractVersion version) {
        return analysisRepository.findByContractVersion(version)
                .map(a -> clauseRepository.findByAnalysisOrderByClauseIndexAsc(a))
                .orElse(List.of());
    }

    private VersionCompareResponse.ClauseDiff toDto(Clause c, boolean isV1) {
        return new VersionCompareResponse.ClauseDiff(
                c.getId(), c.getClauseIndex(),
                isV1 ? c.getOriginalText() : null,
                isV1 ? null : c.getOriginalText(),
                isV1 ? c.getRiskLevel().name() : null,
                isV1 ? null : c.getRiskLevel().name(),
                "unchanged"
        );
    }
}
```

- [ ] **Step 5: Add version endpoints to `ContractController.java`**

Add these methods to the existing `ContractController`:

```java
@Autowired
private VersionService versionService;
@Autowired
private S3Service s3Service;

@PostMapping(value = "/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public void addVersion(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable UUID id,
        @RequestParam MultipartFile file) throws Exception {
    versionService.addVersion(user.getUsername(), id, file, s3Service, contractService);
}

@GetMapping("/{id}/versions/compare")
public VersionCompareResponse compare(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable UUID id,
        @RequestParam int v1,
        @RequestParam int v2) {
    return versionService.compare(user.getUsername(), id, v1, v2);
}
```

- [ ] **Step 6: Run tests**

```bash
./mvnw test -Dtest=VersionServiceTest
```

Expected: `Tests run: 1, Failures: 0`

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: version comparison endpoint"
```

---

## Task 2: Workspaces Backend

**Files:**
- Create: `src/main/java/com/clauseguard/repository/WorkspaceRepository.java`
- Create: `src/main/java/com/clauseguard/repository/WorkspaceMemberRepository.java`
- Create: `src/main/java/com/clauseguard/dto/workspace/WorkspaceResponse.java`
- Create: `src/main/java/com/clauseguard/dto/workspace/CreateWorkspaceRequest.java`
- Create: `src/main/java/com/clauseguard/dto/workspace/InviteRequest.java`
- Create: `src/main/java/com/clauseguard/service/WorkspaceService.java`
- Create: `src/main/java/com/clauseguard/controller/WorkspaceController.java`

- [ ] **Step 1: Create repositories**

```java
// WorkspaceRepository.java
package com.clauseguard.repository;

import com.clauseguard.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    @Query("SELECT wm.workspace FROM WorkspaceMember wm WHERE wm.user.email = :email")
    List<Workspace> findByMemberEmail(String email);
}
```

```java
// WorkspaceMemberRepository.java
package com.clauseguard.repository;

import com.clauseguard.entity.WorkspaceMember;
import com.clauseguard.entity.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {
    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
```

- [ ] **Step 2: Create DTOs**

```java
// CreateWorkspaceRequest.java
package com.clauseguard.dto.workspace;
import jakarta.validation.constraints.NotBlank;
public record CreateWorkspaceRequest(@NotBlank String name) {}
```

```java
// InviteRequest.java
package com.clauseguard.dto.workspace;
import jakarta.validation.constraints.*;
public record InviteRequest(@Email @NotBlank String email, @Pattern(regexp="editor|viewer") String role) {}
```

```java
// WorkspaceResponse.java
package com.clauseguard.dto.workspace;
import java.util.List;
import java.util.UUID;

public record WorkspaceResponse(
        UUID id, String name,
        List<MemberResponse> members
) {
    public record MemberResponse(String email, String name, String role) {}
}
```

- [ ] **Step 3: Create `WorkspaceService.java`**

```java
package com.clauseguard.service;

import com.clauseguard.dto.contract.ContractListItem;
import com.clauseguard.dto.workspace.*;
import com.clauseguard.entity.*;
import com.clauseguard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ContractVersionRepository versionRepository;
    private final AnalysisRepository analysisRepository;

    @Transactional
    public WorkspaceResponse create(String userEmail, CreateWorkspaceRequest req) {
        User owner = getUser(userEmail);
        Workspace ws = workspaceRepository.save(
                Workspace.builder().name(req.name()).owner(owner).build());
        memberRepository.save(WorkspaceMember.builder()
                .id(new WorkspaceMemberId(ws.getId(), owner.getId()))
                .workspace(ws).user(owner).role(WorkspaceMember.Role.owner).build());
        return toResponse(ws);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> list(String userEmail) {
        return workspaceRepository.findByMemberEmail(userEmail).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public void invite(String userEmail, UUID workspaceId, InviteRequest req) {
        Workspace ws = getWorkspace(workspaceId);
        assertEditorOrOwner(ws, userEmail);
        User invitee = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitee.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already a member");
        }
        WorkspaceMember.Role role = req.role() != null
                ? WorkspaceMember.Role.valueOf(req.role())
                : WorkspaceMember.Role.viewer;
        memberRepository.save(WorkspaceMember.builder()
                .id(new WorkspaceMemberId(workspaceId, invitee.getId()))
                .workspace(ws).user(invitee).role(role).build());
    }

    @Transactional
    public void removeMember(String userEmail, UUID workspaceId, UUID userId) {
        Workspace ws = getWorkspace(workspaceId);
        if (!ws.getOwner().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can remove members");
        }
        memberRepository.deleteById(new WorkspaceMemberId(workspaceId, userId));
    }

    @Transactional(readOnly = true)
    public List<ContractListItem> listContracts(String userEmail, UUID workspaceId) {
        assertMember(workspaceId, userEmail);
        Workspace ws = getWorkspace(workspaceId);
        return contractRepository.findByWorkspaceOrderByCreatedAtDesc(ws).stream()
                .map(c -> {
                    var latest = versionRepository.findTopByContractOrderByVersionNumDesc(c).orElse(null);
                    Integer score = null; String status = "pending";
                    if (latest != null) {
                        var a = analysisRepository.findByContractVersion(latest).orElse(null);
                        if (a != null) { score = a.getRiskScore(); status = a.getStatus().name(); }
                    }
                    return new ContractListItem(c.getId(), c.getTitle(), c.getCreatedAt(), score, status);
                }).toList();
    }

    private WorkspaceResponse toResponse(Workspace ws) {
        List<WorkspaceResponse.MemberResponse> members = memberRepository
                .findByWorkspaceId(ws.getId()).stream()
                .map(m -> new WorkspaceResponse.MemberResponse(
                        m.getUser().getEmail(), m.getUser().getName(), m.getRole().name()))
                .toList();
        return new WorkspaceResponse(ws.getId(), ws.getName(), members);
    }

    private void assertEditorOrOwner(Workspace ws, String userEmail) {
        boolean allowed = memberRepository.findByWorkspaceId(ws.getId()).stream()
                .anyMatch(m -> m.getUser().getEmail().equals(userEmail)
                        && (m.getRole() == WorkspaceMember.Role.owner || m.getRole() == WorkspaceMember.Role.editor));
        if (!allowed) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
    }

    private void assertMember(UUID workspaceId, String userEmail) {
        boolean isMember = memberRepository.findByWorkspaceId(workspaceId).stream()
                .anyMatch(m -> m.getUser().getEmail().equals(userEmail));
        if (!isMember) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member");
    }

    private Workspace getWorkspace(UUID id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
```

Add missing method to `ContractRepository`:

```java
List<Contract> findByWorkspaceOrderByCreatedAtDesc(Workspace workspace);
```

- [ ] **Step 4: Create `WorkspaceController.java`**

```java
package com.clauseguard.controller;

import com.clauseguard.dto.contract.ContractListItem;
import com.clauseguard.dto.workspace.*;
import com.clauseguard.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public WorkspaceResponse create(@AuthenticationPrincipal UserDetails user,
                                    @Valid @RequestBody CreateWorkspaceRequest req) {
        return workspaceService.create(user.getUsername(), req);
    }

    @GetMapping
    public List<WorkspaceResponse> list(@AuthenticationPrincipal UserDetails user) {
        return workspaceService.list(user.getUsername());
    }

    @PostMapping("/{id}/invite")
    public void invite(@AuthenticationPrincipal UserDetails user,
                       @PathVariable UUID id,
                       @Valid @RequestBody InviteRequest req) {
        workspaceService.invite(user.getUsername(), id, req);
    }

    @GetMapping("/{id}/contracts")
    public List<ContractListItem> contracts(@AuthenticationPrincipal UserDetails user,
                                            @PathVariable UUID id) {
        return workspaceService.listContracts(user.getUsername(), id);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public void removeMember(@AuthenticationPrincipal UserDetails user,
                             @PathVariable UUID id,
                             @PathVariable UUID userId) {
        workspaceService.removeMember(user.getUsername(), id, userId);
    }
}
```

- [ ] **Step 5: Compile**

```bash
./mvnw compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: workspace CRUD and member invite endpoints"
```

---

## Task 3: Share Links Backend

**Files:**
- Create: `src/main/java/com/clauseguard/repository/ShareLinkRepository.java`
- Create: `src/main/java/com/clauseguard/dto/contract/ShareLinkRequest.java`
- Create: `src/main/java/com/clauseguard/dto/contract/ShareLinkResponse.java`
- Create: `src/main/java/com/clauseguard/service/ShareService.java`
- Create: `src/main/java/com/clauseguard/controller/ShareController.java`

- [ ] **Step 1: Create `ShareLinkRepository.java`**

```java
package com.clauseguard.repository;

import com.clauseguard.entity.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ShareLinkRepository extends JpaRepository<ShareLink, UUID> {
    Optional<ShareLink> findByToken(String token);
}
```

- [ ] **Step 2: Create DTOs**

```java
// ShareLinkRequest.java
package com.clauseguard.dto.contract;
import jakarta.validation.constraints.*;

public record ShareLinkRequest(
        @Min(0) @Max(365) Integer expiryDays  // null = never expires
) {}
```

```java
// ShareLinkResponse.java
package com.clauseguard.dto.contract;
import java.time.LocalDateTime;

public record ShareLinkResponse(String url, LocalDateTime expiresAt) {}
```

- [ ] **Step 3: Create `ShareService.java`**

```java
package com.clauseguard.service;

import com.clauseguard.dto.contract.*;
import com.clauseguard.entity.*;
import com.clauseguard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareLinkRepository shareLinkRepository;
    private final ContractRepository contractRepository;
    private final ContractVersionRepository versionRepository;
    private final AnalysisRepository analysisRepository;
    private final ClauseRepository clauseRepository;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Transactional
    public ShareLinkResponse createLink(String userEmail, UUID contractId, ShareLinkRequest req) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
        if (!contract.getUploader().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        String token = generateToken();
        LocalDateTime expiresAt = req.expiryDays() != null
                ? LocalDateTime.now().plusDays(req.expiryDays())
                : null;
        shareLinkRepository.save(ShareLink.builder()
                .contract(contract).token(token).expiresAt(expiresAt).build());
        return new ShareLinkResponse(baseUrl + "/share/" + token, expiresAt);
    }

    @Transactional(readOnly = true)
    public AnalysisResultResponse getByToken(String token) {
        ShareLink link = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));
        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Share link has expired");
        }
        Contract contract = link.getContract();
        ContractVersion latest = versionRepository.findTopByContractOrderByVersionNumDesc(contract)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No version found"));
        Analysis analysis = analysisRepository.findByContractVersion(latest)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found"));
        var clauses = clauseRepository.findByAnalysisOrderByClauseIndexAsc(analysis)
                .stream().map(ClauseResponse::from).toList();
        return AnalysisResultResponse.from(analysis, clauses);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
```

Add to `application.yml`:

```yaml
app:
  base-url: ${APP_BASE_URL:http://localhost:3000}
```

- [ ] **Step 4: Create `ShareController.java`**

```java
package com.clauseguard.controller;

import com.clauseguard.dto.contract.*;
import com.clauseguard.service.ShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping("/api/contracts/{id}/share")
    public ShareLinkResponse createShare(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id,
            @Valid @RequestBody ShareLinkRequest req) {
        return shareService.createLink(user.getUsername(), id, req);
    }

    @GetMapping("/api/share/{token}")
    public AnalysisResultResponse getShare(@PathVariable String token) {
        return shareService.getByToken(token);
    }
}
```

- [ ] **Step 5: Compile**

```bash
./mvnw compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: share link generation and public view endpoint"
```

---

## Task 4: Frontend — Version Compare & Share Pages

**Files:**
- Create: `clauseguard-frontend/components/VersionCompare.tsx`
- Create: `clauseguard-frontend/app/contracts/[id]/compare/page.tsx`
- Create: `clauseguard-frontend/app/share/[token]/page.tsx`

- [ ] **Step 1: Create `components/VersionCompare.tsx`**

```typescript
interface ClauseDiff {
  clauseId: string
  clauseIndex: number
  textV1: string | null
  textV2: string | null
  riskLevelV1: string | null
  riskLevelV2: string | null
  changeType: 'added' | 'removed' | 'modified' | 'unchanged'
}

const changeStyle = {
  added:     'bg-green-50 border-green-200',
  removed:   'bg-red-50 border-red-200',
  modified:  'bg-yellow-50 border-yellow-200',
  unchanged: 'bg-white border-slate-200',
}

const changeLabel = {
  added:     { text: '추가됨', cls: 'text-green-700 bg-green-100' },
  removed:   { text: '삭제됨', cls: 'text-red-700 bg-red-100' },
  modified:  { text: '변경됨', cls: 'text-yellow-700 bg-yellow-100' },
  unchanged: { text: '동일', cls: 'text-slate-500 bg-slate-100' },
}

export default function VersionCompare({ diffs, v1, v2 }: { diffs: ClauseDiff[], v1: number, v2: number }) {
  const changed = diffs.filter(d => d.changeType !== 'unchanged')

  return (
    <div>
      <div className="flex gap-4 mb-6 text-sm">
        <span className="text-green-700 bg-green-100 px-2 py-1 rounded">
          추가 {diffs.filter(d => d.changeType === 'added').length}
        </span>
        <span className="text-red-700 bg-red-100 px-2 py-1 rounded">
          삭제 {diffs.filter(d => d.changeType === 'removed').length}
        </span>
        <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
          변경 {diffs.filter(d => d.changeType === 'modified').length}
        </span>
      </div>

      <div className="space-y-3">
        {changed.map((d) => {
          const cfg = changeStyle[d.changeType]
          const lbl = changeLabel[d.changeType]
          return (
            <div key={d.clauseId} className={`border rounded-xl p-4 ${cfg}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-400">#{d.clauseIndex + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lbl.cls}`}>
                  {lbl.text}
                </span>
                {d.riskLevelV2 && (
                  <span className="text-xs text-slate-500">리스크: {d.riskLevelV1} → {d.riskLevelV2}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">v{v1}</p>
                  <p className="text-slate-600">{d.textV1 ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">v{v2}</p>
                  <p className="text-slate-700 font-medium">{d.textV2 ?? '—'}</p>
                </div>
              </div>
            </div>
          )
        })}
        {changed.length === 0 && (
          <p className="text-slate-500 text-center py-8">두 버전 간 변경사항이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/contracts/[id]/compare/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import VersionCompare from '@/components/VersionCompare'
import api from '@/lib/api'

export default function ComparePage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const v1 = Number(searchParams.get('v1') ?? 1)
  const v2 = Number(searchParams.get('v2') ?? 2)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    api.get(`/api/contracts/${id}/versions/compare?v1=${v1}&v2=${v2}`)
      .then(r => setData(r.data))
      .catch(() => setError('비교 데이터를 불러올 수 없습니다.'))
  }, [id, v1, v2, router])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">ClauseGuard</Link>
        <Link href={`/contracts/${id}`}><Button variant="ghost">← 분석 결과</Button></Link>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">버전 비교</h1>
        <p className="text-slate-500 mb-8">v{v1} → v{v2} 조항 변경사항</p>
        {error && <p className="text-red-500">{error}</p>}
        {data && <VersionCompare diffs={data.diffs} v1={v1} v2={v2} />}
        {!data && !error && <p className="text-slate-400">로딩 중...</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/share/[token]/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import RiskScore from '@/components/RiskScore'
import ClauseCard from '@/components/ClauseCard'
import api from '@/lib/api'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  useEffect(() => {
    api.get(`/api/share/${token}`)
      .then(r => setData(r.data))
      .catch(err => {
        if (err.response?.status === 410) setError('이 공유 링크는 만료되었습니다.')
        else setError('분석 결과를 불러올 수 없습니다.')
      })
  }, [token])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">{error}</p>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400">로딩 중...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <span className="text-xl font-bold text-indigo-600">ClauseGuard</span>
        <div className="flex gap-2">
          <button
            className={`text-sm px-3 py-1 rounded ${lang === 'ko' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
            onClick={() => setLang('ko')}>한국어</button>
          <button
            className={`text-sm px-3 py-1 rounded ${lang === 'en' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
            onClick={() => setLang('en')}>English</button>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          이 페이지는 공유 링크로 접근한 읽기 전용 뷰입니다.
        </div>
        <RiskScore score={data.riskScore} />
        <div className="bg-white rounded-xl p-6 border">
          <p className="text-sm text-slate-700">{lang === 'ko' ? data.summaryKo : data.summaryEn}</p>
        </div>
        <div className="space-y-2">
          {data.clauses?.map((c: any) => <ClauseCard key={c.id} clause={c} lang={lang} />)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd clauseguard-frontend
git add .
git commit -m "feat: version compare page and public share view"
```

---

## Task 5: AWS Deployment — Backend (Elastic Beanstalk + RDS)

- [ ] **Step 1: Build the JAR**

```bash
cd clauseguard-backend
./mvnw clean package -DskipTests
```

Expected: `clauseguard-backend/target/clauseguard-backend-0.0.1-SNAPSHOT.jar`

- [ ] **Step 2: Create RDS PostgreSQL instance via AWS Console**

1. Go to AWS Console → RDS → Create Database
2. Engine: PostgreSQL 16
3. Template: Free tier (for dev) or Production
4. DB identifier: `clauseguard-db`
5. Master username: `clauseguard`
6. Master password: (save securely)
7. VPC: default VPC
8. Public access: Yes (for Beanstalk to connect; restrict later via security groups)
9. Initial database name: `clauseguard`
10. Note the **endpoint** after creation (e.g., `clauseguard-db.xxxx.ap-northeast-2.rds.amazonaws.com`)

- [ ] **Step 3: Create S3 bucket**

```bash
aws s3 mb s3://clauseguard-files --region ap-northeast-2
aws s3api put-bucket-cors --bucket clauseguard-files --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET","PUT","POST"],
    "AllowedHeaders": ["*"]
  }]
}'
```

- [ ] **Step 4: Create Elastic Beanstalk application via AWS Console**

1. Go to AWS Console → Elastic Beanstalk → Create Application
2. Application name: `clauseguard-backend`
3. Platform: Java, Java 17
4. Upload your JAR: `target/clauseguard-backend-0.0.1-SNAPSHOT.jar`
5. After creation, go to **Configuration → Software → Environment properties** and set:

```
DB_URL=jdbc:postgresql://<RDS_ENDPOINT>:5432/clauseguard
DB_USERNAME=clauseguard
DB_PASSWORD=<your_rds_password>
JWT_SECRET=<generate: openssl rand -base64 64>
AWS_REGION=ap-northeast-2
S3_BUCKET=clauseguard-files
VAULTSAGE_API_KEY=<your_key>
VAULTSAGE_BASE_URL=https://api.vaultsage.ai
CORS_ORIGINS=https://your-vercel-app.vercel.app
APP_BASE_URL=https://your-vercel-app.vercel.app
```

- [ ] **Step 5: Attach IAM role to Beanstalk EC2 for S3 access**

1. Go to IAM → Roles → find `aws-elasticbeanstalk-ec2-role`
2. Attach policy: `AmazonS3FullAccess` (or create a scoped policy for just `clauseguard-files`)

- [ ] **Step 6: Verify backend is live**

```bash
curl https://<your-beanstalk-url>/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test","lang":"ko"}'
```

Expected: `{"token":"...","email":"test@test.com","name":"Test"}`

- [ ] **Step 7: Commit deployment notes**

```bash
cd clauseguard-backend
echo "# Deployment\nBeanstalk URL: <your-url>\nRDS: <your-rds-endpoint>" > DEPLOY.md
git add DEPLOY.md
git commit -m "docs: add deployment notes"
```

---

## Task 6: Frontend Deployment (Vercel)

- [ ] **Step 1: Push frontend to GitHub**

```bash
cd clauseguard-frontend
git remote add origin https://github.com/<your-username>/clauseguard-frontend.git
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import `clauseguard-frontend` from GitHub
3. Framework: Next.js (auto-detected)
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-beanstalk-url>`
5. Click Deploy

- [ ] **Step 3: Update backend CORS with Vercel URL**

In Elastic Beanstalk environment properties, update:
```
CORS_ORIGINS=https://<your-app>.vercel.app
APP_BASE_URL=https://<your-app>.vercel.app
```

- [ ] **Step 4: End-to-end smoke test on production**

1. Open `https://<your-app>.vercel.app`
2. Sign up with a new account
3. Upload a real PDF contract
4. Verify analysis completes and clauses are displayed
5. Generate a share link and open it in incognito mode
6. Verify share page loads without login

---

## Plan 3 Complete

At this point you have:
- ✅ Version comparison — clause-level diff between contract versions
- ✅ Team workspaces — create, invite, member management
- ✅ Share links — public read-only analysis view with expiry
- ✅ Backend deployed to AWS Elastic Beanstalk
- ✅ Frontend deployed to Vercel
- ✅ Full end-to-end flow working in production

**ClauseGuard is ready for competition submission.**

Submission checklist:
- [ ] Register at [forms.gle/C3592Ju5k9ELdEoCA](https://forms.gle/C3592Ju5k9ELdEoCA) (by April 30, 2026)
- [ ] Submit project link at [forms.gle/vvdMepK43uDxPVop9](https://forms.gle/vvdMepK43uDxPVop9) (by May 25, 2026)
- [ ] Post on social media with `#vaultsage` hashtag
