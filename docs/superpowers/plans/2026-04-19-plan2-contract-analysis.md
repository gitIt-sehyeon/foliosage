# ClauseGuard — Plan 2: Contract Analysis (VaultSage Core)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement contract upload, VaultSage API integration for analysis, result storage, and frontend display of risk dashboard and clause-level details.

**Architecture:** `POST /api/contracts` accepts a file + title, stores it to S3, triggers VaultSage analysis asynchronously (Spring `@Async`), and persists results. The frontend polls for completion and renders a risk score, summary, and per-clause breakdown with negotiation suggestions.

**Tech Stack:** Spring Boot (Java 17), Spring `@Async`, AWS S3, WebClient (VaultSage), React Query (polling), Next.js App Router, shadcn/ui

**Prerequisite:** Plan 1 must be complete and all auth tests passing.

---

## File Structure (additions to Plan 1)

### Backend
```
src/main/java/com/clauseguard/
  config/
    WebClientConfig.java
    AsyncConfig.java
  repository/
    ContractRepository.java
    ContractVersionRepository.java
    AnalysisRepository.java
    ClauseRepository.java
  dto/
    contract/ContractUploadResponse.java
    contract/ContractListItem.java
    contract/AnalysisResultResponse.java
    contract/ClauseResponse.java
  service/
    ContractService.java
    VaultSageService.java
  controller/
    ContractController.java
```

### Frontend
```
app/
  contracts/
    new/page.tsx
    [id]/page.tsx
components/
  ContractUpload.tsx
  RiskScore.tsx
  ClauseCard.tsx
  AnalysisStatus.tsx
```

---

## Task 1: VaultSage Service

**Files:**
- Create: `src/main/java/com/clauseguard/config/WebClientConfig.java`
- Create: `src/main/java/com/clauseguard/config/AsyncConfig.java`
- Create: `src/main/java/com/clauseguard/service/VaultSageService.java`
- Test: `src/test/java/com/clauseguard/service/VaultSageServiceTest.java`

- [ ] **Step 1: Create `WebClientConfig.java`**

```java
package com.clauseguard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${vaultsage.base-url}")
    private String baseUrl;

    @Value("${vaultsage.api-key}")
    private String apiKey;

    @Bean
    public WebClient vaultSageWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
```

Add `spring-boot-starter-webflux` to `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

- [ ] **Step 2: Create `AsyncConfig.java`**

```java
package com.clauseguard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "analysisExecutor")
    public Executor analysisExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("analysis-");
        executor.initialize();
        return executor;
    }
}
```

- [ ] **Step 3: Write failing test for VaultSageService**

```java
// src/test/java/com/clauseguard/service/VaultSageServiceTest.java
package com.clauseguard.service;

import com.clauseguard.entity.Analysis;
import com.clauseguard.entity.Clause;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class VaultSageServiceTest {

    @Test
    void parseVaultSageResponse_extractsRiskScoreAndClauses() {
        // Minimal unit test for the response parser (no HTTP call)
        String mockJson = """
            {
              "risk_score": 72,
              "summary_ko": "이 계약서에는 3개의 위험 조항이 있습니다.",
              "summary_en": "This contract contains 3 risky clauses.",
              "clauses": [
                {
                  "index": 0,
                  "text": "Contractor waives all IP rights.",
                  "risk_level": "high",
                  "explanation_ko": "모든 IP 권리를 포기합니다.",
                  "explanation_en": "You give up all intellectual property rights.",
                  "suggestion_ko": "IP 권리를 특정 프로젝트로 한정하세요.",
                  "suggestion_en": "Limit IP transfer to specific project deliverables only."
                }
              ]
            }
            """;

        VaultSageService service = new VaultSageService(null);
        VaultSageService.ParsedAnalysis result = service.parseResponse(mockJson);

        assertThat(result.riskScore()).isEqualTo(72);
        assertThat(result.clauses()).hasSize(1);
        assertThat(result.clauses().get(0).riskLevel()).isEqualTo(Clause.RiskLevel.high);
    }
}
```

- [ ] **Step 4: Run test to confirm it fails**

```bash
./mvnw test -Dtest=VaultSageServiceTest
```

Expected: FAIL — `VaultSageService` not found

- [ ] **Step 5: Create `VaultSageService.java`**

```java
package com.clauseguard.service;

import com.clauseguard.entity.Clause;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class VaultSageService {

    private final WebClient vaultSageWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record ClauseData(
            int index,
            String text,
            Clause.RiskLevel riskLevel,
            String explanationKo,
            String explanationEn,
            String suggestionKo,
            String suggestionEn
    ) {}

    public record ParsedAnalysis(
            int riskScore,
            String summaryKo,
            String summaryEn,
            List<ClauseData> clauses
    ) {}

    /**
     * Send document text to VaultSage and receive structured analysis.
     * Adjust the endpoint path once you confirm the actual VaultSage API docs.
     */
    public ParsedAnalysis analyze(String documentText) {
        String responseJson = vaultSageWebClient.post()
                .uri("/v1/analyze")
                .bodyValue("""
                        {"content": %s, "language": ["ko", "en"]}
                        """.formatted(objectMapper.valueToTree(documentText)))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return parseResponse(responseJson);
    }

    public ParsedAnalysis parseResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            int riskScore = root.path("risk_score").asInt(0);
            String summaryKo = root.path("summary_ko").asText("");
            String summaryEn = root.path("summary_en").asText("");

            List<ClauseData> clauses = new ArrayList<>();
            for (JsonNode c : root.path("clauses")) {
                clauses.add(new ClauseData(
                        c.path("index").asInt(),
                        c.path("text").asText(),
                        Clause.RiskLevel.valueOf(c.path("risk_level").asText("low")),
                        c.path("explanation_ko").asText(""),
                        c.path("explanation_en").asText(""),
                        c.path("suggestion_ko").asText(""),
                        c.path("suggestion_en").asText("")
                ));
            }
            return new ParsedAnalysis(riskScore, summaryKo, summaryEn, clauses);
        } catch (Exception e) {
            log.error("Failed to parse VaultSage response", e);
            throw new RuntimeException("VaultSage response parsing failed", e);
        }
    }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
./mvnw test -Dtest=VaultSageServiceTest
```

Expected: `Tests run: 1, Failures: 0`

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add VaultSage service with response parser"
```

---

## Task 2: Contract Upload & Analysis Backend

**Files:**
- Create: `src/main/java/com/clauseguard/repository/ContractRepository.java`
- Create: `src/main/java/com/clauseguard/repository/ContractVersionRepository.java`
- Create: `src/main/java/com/clauseguard/repository/AnalysisRepository.java`
- Create: `src/main/java/com/clauseguard/repository/ClauseRepository.java`
- Create: `src/main/java/com/clauseguard/dto/contract/ContractUploadResponse.java`
- Create: `src/main/java/com/clauseguard/dto/contract/AnalysisResultResponse.java`
- Create: `src/main/java/com/clauseguard/dto/contract/ClauseResponse.java`
- Create: `src/main/java/com/clauseguard/dto/contract/ContractListItem.java`
- Create: `src/main/java/com/clauseguard/service/ContractService.java`
- Create: `src/main/java/com/clauseguard/controller/ContractController.java`
- Test: `src/test/java/com/clauseguard/controller/ContractControllerTest.java`

- [ ] **Step 1: Create repositories**

```java
// ContractRepository.java
package com.clauseguard.repository;

import com.clauseguard.entity.Contract;
import com.clauseguard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contract, UUID> {
    List<Contract> findByUploaderOrderByCreatedAtDesc(User uploader);
}
```

```java
// ContractVersionRepository.java
package com.clauseguard.repository;

import com.clauseguard.entity.Contract;
import com.clauseguard.entity.ContractVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContractVersionRepository extends JpaRepository<ContractVersion, UUID> {
    List<ContractVersion> findByContractOrderByVersionNumAsc(Contract contract);
    Optional<ContractVersion> findTopByContractOrderByVersionNumDesc(Contract contract);
}
```

```java
// AnalysisRepository.java
package com.clauseguard.repository;

import com.clauseguard.entity.Analysis;
import com.clauseguard.entity.ContractVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {
    Optional<Analysis> findByContractVersion(ContractVersion version);
}
```

```java
// ClauseRepository.java
package com.clauseguard.repository;

import com.clauseguard.entity.Analysis;
import com.clauseguard.entity.Clause;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ClauseRepository extends JpaRepository<Clause, UUID> {
    List<Clause> findByAnalysisOrderByClauseIndexAsc(Analysis analysis);
}
```

- [ ] **Step 2: Create DTOs**

```java
// ContractUploadResponse.java
package com.clauseguard.dto.contract;

import java.util.UUID;

public record ContractUploadResponse(UUID contractId, UUID analysisId, String status) {}
```

```java
// ClauseResponse.java
package com.clauseguard.dto.contract;

import com.clauseguard.entity.Clause;
import java.util.UUID;

public record ClauseResponse(
        UUID id,
        int clauseIndex,
        String originalText,
        String riskLevel,
        String explanationKo,
        String explanationEn,
        String suggestionKo,
        String suggestionEn
) {
    public static ClauseResponse from(Clause c) {
        return new ClauseResponse(c.getId(), c.getClauseIndex(), c.getOriginalText(),
                c.getRiskLevel().name(), c.getExplanationKo(), c.getExplanationEn(),
                c.getSuggestionKo(), c.getSuggestionEn());
    }
}
```

```java
// AnalysisResultResponse.java
package com.clauseguard.dto.contract;

import com.clauseguard.entity.Analysis;
import java.util.List;
import java.util.UUID;

public record AnalysisResultResponse(
        UUID contractId,
        UUID analysisId,
        String status,
        Integer riskScore,
        String summaryKo,
        String summaryEn,
        List<ClauseResponse> clauses
) {
    public static AnalysisResultResponse from(Analysis a, List<ClauseResponse> clauses) {
        return new AnalysisResultResponse(
                a.getContractVersion().getContract().getId(),
                a.getId(),
                a.getStatus().name(),
                a.getRiskScore(),
                a.getSummaryKo(),
                a.getSummaryEn(),
                clauses
        );
    }
}
```

```java
// ContractListItem.java
package com.clauseguard.dto.contract;

import com.clauseguard.entity.Contract;
import java.time.LocalDateTime;
import java.util.UUID;

public record ContractListItem(UUID id, String title, LocalDateTime createdAt, Integer riskScore, String analysisStatus) {}
```

- [ ] **Step 3: Create `ContractService.java`**

```java
package com.clauseguard.service;

import com.clauseguard.dto.contract.*;
import com.clauseguard.entity.*;
import com.clauseguard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final ContractVersionRepository versionRepository;
    private final AnalysisRepository analysisRepository;
    private final ClauseRepository clauseRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final VaultSageService vaultSageService;

    @Transactional
    public ContractUploadResponse upload(String userEmail, String title, MultipartFile file) throws Exception {
        validateFileType(file);
        User user = getUser(userEmail);

        Contract contract = contractRepository.save(
                Contract.builder().uploader(user).title(title).build());

        String s3Key = s3Service.upload(file, "contracts/" + contract.getId());
        ContractVersion version = versionRepository.save(
                ContractVersion.builder().contract(contract).versionNum(1).s3Key(s3Key).build());

        Analysis analysis = analysisRepository.save(
                Analysis.builder().contractVersion(version).status(Analysis.Status.pending).build());

        runAnalysisAsync(analysis.getId(), version.getId(), file.getBytes());

        return new ContractUploadResponse(contract.getId(), analysis.getId(), "pending");
    }

    @Async("analysisExecutor")
    public void runAnalysisAsync(UUID analysisId, UUID versionId, byte[] fileBytes) {
        Analysis analysis = analysisRepository.findById(analysisId).orElseThrow();
        try {
            analysis.setStatus(Analysis.Status.processing);
            analysisRepository.save(analysis);

            String text = new Tika().parseToString(new java.io.ByteArrayInputStream(fileBytes));
            VaultSageService.ParsedAnalysis parsed = vaultSageService.analyze(text);

            analysis.setRiskScore(parsed.riskScore());
            analysis.setSummaryKo(parsed.summaryKo());
            analysis.setSummaryEn(parsed.summaryEn());
            analysis.setStatus(Analysis.Status.done);
            analysisRepository.save(analysis);

            ContractVersion version = analysis.getContractVersion();
            parsed.clauses().forEach(c -> clauseRepository.save(
                    Clause.builder()
                            .analysis(analysis)
                            .clauseIndex(c.index())
                            .originalText(c.text())
                            .riskLevel(c.riskLevel())
                            .explanationKo(c.explanationKo())
                            .explanationEn(c.explanationEn())
                            .suggestionKo(c.suggestionKo())
                            .suggestionEn(c.suggestionEn())
                            .build()
            ));
        } catch (Exception e) {
            log.error("Analysis failed for analysisId={}", analysisId, e);
            analysis.setStatus(Analysis.Status.failed);
            analysisRepository.save(analysis);
        }
    }

    @Transactional(readOnly = true)
    public AnalysisResultResponse getAnalysis(String userEmail, UUID contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
        assertOwner(contract, userEmail);

        ContractVersion latest = versionRepository.findTopByContractOrderByVersionNumDesc(contract)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No version found"));

        Analysis analysis = analysisRepository.findByContractVersion(latest)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found"));

        List<ClauseResponse> clauses = analysis.getStatus() == Analysis.Status.done
                ? clauseRepository.findByAnalysisOrderByClauseIndexAsc(analysis)
                        .stream().map(ClauseResponse::from).toList()
                : List.of();

        return AnalysisResultResponse.from(analysis, clauses);
    }

    @Transactional(readOnly = true)
    public List<ContractListItem> listContracts(String userEmail) {
        User user = getUser(userEmail);
        return contractRepository.findByUploaderOrderByCreatedAtDesc(user).stream()
                .map(c -> {
                    ContractVersion latest = versionRepository
                            .findTopByContractOrderByVersionNumDesc(c).orElse(null);
                    Integer score = null;
                    String status = "pending";
                    if (latest != null) {
                        Analysis a = analysisRepository.findByContractVersion(latest).orElse(null);
                        if (a != null) { score = a.getRiskScore(); status = a.getStatus().name(); }
                    }
                    return new ContractListItem(c.getId(), c.getTitle(), c.getCreatedAt(), score, status);
                }).toList();
    }

    @Transactional
    public void deleteContract(String userEmail, UUID contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
        assertOwner(contract, userEmail);
        versionRepository.findByContractOrderByVersionNumAsc(contract)
                .forEach(v -> s3Service.delete(v.getS3Key()));
        contractRepository.delete(contract);
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("application/pdf") &&
                 !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF and DOCX files are supported");
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void assertOwner(Contract contract, String userEmail) {
        if (!contract.getUploader().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}
```

Add Apache Tika to `pom.xml` for text extraction from PDF/DOCX:

```xml
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-core</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-parsers-standard-package</artifactId>
    <version>2.9.2</version>
</dependency>
```

- [ ] **Step 4: Create `ContractController.java`**

```java
package com.clauseguard.controller;

import com.clauseguard.dto.contract.*;
import com.clauseguard.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ContractUploadResponse upload(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam String title,
            @RequestParam MultipartFile file) throws Exception {
        return contractService.upload(user.getUsername(), title, file);
    }

    @GetMapping
    public List<ContractListItem> list(@AuthenticationPrincipal UserDetails user) {
        return contractService.listContracts(user.getUsername());
    }

    @GetMapping("/{id}")
    public AnalysisResultResponse getAnalysis(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id) {
        return contractService.getAnalysis(user.getUsername(), id);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id) {
        contractService.deleteContract(user.getUsername(), id);
    }
}
```

- [ ] **Step 5: Compile to catch errors**

```bash
./mvnw compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: contract upload, VaultSage analysis, and result endpoints"
```

---

## Task 3: Frontend — Contract Upload Page

**Files:**
- Create: `clauseguard-frontend/app/contracts/new/page.tsx`
- Create: `clauseguard-frontend/components/ContractUpload.tsx`

- [ ] **Step 1: Create `components/ContractUpload.tsx`**

```typescript
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

export default function ContractUpload() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('file', file)
      const { data } = await api.post('/api/contracts', form)
      router.push(`/contracts/${data.contractId}`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? '업로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <Label>계약서 제목</Label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: 소프트웨어 개발 용역 계약서"
          required
        />
      </div>
      <div>
        <Label>파일 업로드 (PDF 또는 DOCX)</Label>
        <div
          className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {file
            ? <p className="text-slate-700 font-medium">{file.name}</p>
            : <p className="text-slate-400">파일을 클릭하거나 드래그하여 업로드</p>
          }
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={loading || !file} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {loading ? 'AI 분석 중...' : '분석 시작'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create `app/contracts/new/page.tsx`**

```typescript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import ContractUpload from '@/components/ContractUpload'
import { Button } from '@/components/ui/button'

export default function NewContractPage() {
  const router = useRouter()
  useEffect(() => {
    if (!isLoggedIn()) router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">ClauseGuard</Link>
        <Link href="/dashboard"><Button variant="ghost">← 대시보드</Button></Link>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">계약서 업로드</h1>
        <p className="text-slate-500 mb-8">
          업로드된 파일은 분석 후 저장되지 않습니다. (VaultSage 보장)
        </p>
        <ContractUpload />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd clauseguard-frontend
git add app/contracts/ components/ContractUpload.tsx
git commit -m "feat: contract upload page"
```

---

## Task 4: Frontend — Analysis Result Page

**Files:**
- Create: `clauseguard-frontend/components/RiskScore.tsx`
- Create: `clauseguard-frontend/components/ClauseCard.tsx`
- Create: `clauseguard-frontend/components/AnalysisStatus.tsx`
- Create: `clauseguard-frontend/app/contracts/[id]/page.tsx`

- [ ] **Step 1: Create `components/RiskScore.tsx`**

```typescript
interface RiskScoreProps { score: number }

export default function RiskScore({ score }: RiskScoreProps) {
  const color = score >= 70 ? 'text-red-600' : score >= 40 ? 'text-yellow-600' : 'text-green-600'
  const label = score >= 70 ? '고위험' : score >= 40 ? '중위험' : '저위험'
  const bg = score >= 70 ? 'bg-red-50' : score >= 40 ? 'bg-yellow-50' : 'bg-green-50'

  return (
    <div className={`rounded-xl p-6 ${bg} flex items-center gap-6`}>
      <div className={`text-6xl font-bold ${color}`}>{score}</div>
      <div>
        <p className={`text-xl font-semibold ${color}`}>{label}</p>
        <p className="text-slate-500 text-sm mt-1">리스크 점수 (0–100)</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/ClauseCard.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Clause {
  id: string
  clauseIndex: number
  originalText: string
  riskLevel: 'low' | 'medium' | 'high'
  explanationKo: string
  explanationEn: string
  suggestionKo: string
  suggestionEn: string
}

const riskConfig = {
  high:   { label: '고위험', variant: 'destructive' as const, border: 'border-red-200' },
  medium: { label: '중위험', variant: 'secondary' as const,   border: 'border-yellow-200' },
  low:    { label: '저위험', variant: 'outline' as const,     border: 'border-green-200' },
}

export default function ClauseCard({ clause, lang = 'ko' }: { clause: Clause; lang?: 'ko' | 'en' }) {
  const [expanded, setExpanded] = useState(clause.riskLevel === 'high')
  const cfg = riskConfig[clause.riskLevel]
  const explanation = lang === 'ko' ? clause.explanationKo : clause.explanationEn
  const suggestion = lang === 'ko' ? clause.suggestionKo : clause.suggestionEn

  return (
    <Card className={`border ${cfg.border}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400">#{clause.clauseIndex + 1}</span>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-sm text-slate-700 flex-1 line-clamp-2">{clause.originalText}</p>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? '접기' : '상세'}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">원문</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded p-3">{clause.originalText}</p>
            </div>
            {explanation && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  {lang === 'ko' ? '위험 설명' : 'Risk Explanation'}
                </p>
                <p className="text-sm text-slate-700">{explanation}</p>
              </div>
            )}
            {suggestion && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 mb-1">
                  {lang === 'ko' ? '협상 제안' : 'Suggested Revision'}
                </p>
                <p className="text-sm text-indigo-700 bg-indigo-50 rounded p-3">{suggestion}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create `components/AnalysisStatus.tsx`**

```typescript
export default function AnalysisStatus({ status }: { status: string }) {
  if (status === 'done') return null
  const messages: Record<string, string> = {
    pending: '분석 대기 중...',
    processing: 'AI가 계약서를 분석하고 있습니다...',
    failed: '분석에 실패했습니다. 다시 시도해 주세요.',
  }
  return (
    <div className={`rounded-lg p-4 text-sm ${status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-700'}`}>
      {status !== 'failed' && (
        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2" />
      )}
      {messages[status] ?? '처리 중...'}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/contracts/[id]/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import RiskScore from '@/components/RiskScore'
import ClauseCard from '@/components/ClauseCard'
import AnalysisStatus from '@/components/AnalysisStatus'
import api from '@/lib/api'

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    const poll = async () => {
      try {
        const res = await api.get(`/api/contracts/${id}`)
        setData(res.data)
        if (res.data.status === 'pending' || res.data.status === 'processing') {
          setTimeout(poll, 3000)
        }
      } catch { router.push('/dashboard') }
    }
    poll()
  }, [id, router])

  if (!data) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>

  const highRisk = data.clauses?.filter((c: any) => c.riskLevel === 'high') ?? []
  const medRisk  = data.clauses?.filter((c: any) => c.riskLevel === 'medium') ?? []
  const lowRisk  = data.clauses?.filter((c: any) => c.riskLevel === 'low') ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">ClauseGuard</Link>
        <div className="flex gap-2">
          <Button variant={lang === 'ko' ? 'default' : 'outline'} size="sm" onClick={() => setLang('ko')}>한국어</Button>
          <Button variant={lang === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLang('en')}>English</Button>
          <Link href="/dashboard"><Button variant="ghost" size="sm">← 대시보드</Button></Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <AnalysisStatus status={data.status} />

        {data.status === 'done' && (
          <>
            <RiskScore score={data.riskScore} />
            <div className="bg-white rounded-xl p-6 border">
              <h2 className="font-semibold text-slate-700 mb-2">
                {lang === 'ko' ? '요약' : 'Summary'}
              </h2>
              <p className="text-slate-600 text-sm">
                {lang === 'ko' ? data.summaryKo : data.summaryEn}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold text-slate-700">
                고위험 조항 ({highRisk.length})
              </h2>
              {highRisk.map((c: any) => <ClauseCard key={c.id} clause={c} lang={lang} />)}
            </div>

            {medRisk.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold text-slate-700">중위험 조항 ({medRisk.length})</h2>
                {medRisk.map((c: any) => <ClauseCard key={c.id} clause={c} lang={lang} />)}
              </div>
            )}

            {lowRisk.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold text-slate-700">저위험 조항 ({lowRisk.length})</h2>
                {lowRisk.map((c: any) => <ClauseCard key={c.id} clause={c} lang={lang} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Update dashboard to show contract list and link to upload**

Replace `app/dashboard/page.tsx` content:

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
  const [contracts, setContracts] = useState<any[]>([])

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    api.get('/api/contracts').then(r => setContracts(r.data))
  }, [router])

  const riskColor = (score: number | null) => {
    if (!score) return 'secondary'
    return score >= 70 ? 'destructive' : score >= 40 ? 'secondary' : 'outline'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <span className="text-xl font-bold text-indigo-600">ClauseGuard</span>
        <div className="flex gap-2">
          <Link href="/contracts/new"><Button>+ 계약서 업로드</Button></Link>
          <Button variant="ghost" onClick={() => { removeToken(); router.push('/login') }}>로그아웃</Button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">내 계약서</h1>
        {contracts.length === 0
          ? <p className="text-slate-500">분석한 계약서가 없습니다. 첫 계약서를 업로드해보세요.</p>
          : (
            <div className="space-y-3">
              {contracts.map((c: any) => (
                <Link key={c.id} href={`/contracts/${c.id}`}>
                  <div className="bg-white rounded-xl border p-4 hover:border-indigo-300 transition-colors cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.riskScore !== null && (
                        <Badge variant={riskColor(c.riskScore)}>리스크 {c.riskScore}</Badge>
                      )}
                      <Badge variant="outline">{c.analysisStatus}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Start both servers and verify end-to-end flow**

```bash
# Terminal 1 — backend
cd clauseguard-backend && ./mvnw spring-boot:run

# Terminal 2 — frontend
cd clauseguard-frontend && npm run dev
```

1. Open http://localhost:3000
2. Sign up → redirected to dashboard
3. Click "계약서 업로드" → upload a real PDF or DOCX
4. Redirected to analysis page — should show "분석 중..." then results once done

- [ ] **Step 7: Commit**

```bash
cd clauseguard-frontend
git add .
git commit -m "feat: analysis result page with risk score and clause cards"
```

---

## Plan 2 Complete

At this point you have:
- ✅ VaultSage API integration with async analysis pipeline
- ✅ Apache Tika for PDF/DOCX text extraction
- ✅ Contract upload → S3 → VaultSage → DB pipeline
- ✅ Analysis result page with risk score, summary, clause breakdown
- ✅ Korean/English language toggle
- ✅ Dashboard showing contract list with risk scores
- ✅ Polling for analysis completion

**Important:** Verify the actual VaultSage API endpoint (`/v1/analyze`) and request/response format from the API docs before running against live API. Adjust `VaultSageService.analyze()` accordingly.

**Next:** Proceed to Plan 3 — Version Comparison, Workspaces, Share Links, and AWS Deployment.
