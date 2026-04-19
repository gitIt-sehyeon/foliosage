# FolioSage Plan 3: Public Portfolio, Certificates & Deployment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public portfolio page (gallery + AI chat), publish flow with VaultSage Share API, creation certificate PDF download, visitor analytics, and deploy backend to AWS Elastic Beanstalk + frontend to Vercel.

**Architecture:** `PublicController` handles all unauthenticated routes, proxying VaultSage's `chat/public` API and `share/access-logs`. `CertificateService` generates PDF using Apache PDFBox. The public page polls VaultSage chat for streamed responses and renders the gallery with file previews.

**Tech Stack:** Spring Boot, Apache PDFBox, VaultSage Chat API, VaultSage Share API, Next.js, AWS Elastic Beanstalk, AWS RDS, Vercel

**Prerequisite:** Plans 1 and 2 complete.

---

## File Structure (additions)

### Backend
```
src/main/java/com/foliosage/
  service/
    CertificateService.java
    PublishService.java
  controller/
    PublicController.java
  dto/portfolio/
    PublishResponse.java
    ChatRequest.java
    ChatResponse.java
    VisitorLogResponse.java
```

### Frontend
```
app/
  p/[shareCode]/page.tsx
components/
  ChatPanel.tsx
  CertificateBadge.tsx
```

---

## Task 1: Publish Flow (VaultSage Share API)

**Files:**
- Create: `src/main/java/com/foliosage/dto/portfolio/PublishResponse.java`
- Create: `src/main/java/com/foliosage/service/PublishService.java`
- Add endpoint to: `src/main/java/com/foliosage/controller/PortfolioController.java`
- Test: `src/test/java/com/foliosage/service/PublishServiceTest.java`

- [ ] **Step 1: Write failing test**

```java
package com.foliosage.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class PublishServiceTest {

    @Test
    void buildShareUrl_appendsShareCodeToBaseUrl() {
        PublishService service = new PublishService(null, null, null, null, "https://foliosage.app");
        String url = service.buildShareUrl("abc123");
        assertThat(url).isEqualTo("https://foliosage.app/p/abc123");
    }
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
./gradlew test --tests "*.PublishServiceTest"
```

Expected: FAIL — `PublishService` not found

- [ ] **Step 3: Create `PublishResponse.java`**

```java
package com.foliosage.dto.portfolio;

public record PublishResponse(String shareCode, String shareUrl) {}
```

- [ ] **Step 4: Create `PublishService.java`**

```java
package com.foliosage.service;

import com.foliosage.dto.portfolio.PublishResponse;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class PublishService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final UserRepository userRepository;
    private final VaultSageService vaultSageService;

    @Value("${app.base-url}")
    private final String baseUrl;

    public PublishService(PortfolioRepository pr, PortfolioFileRepository fr,
                          UserRepository ur, VaultSageService vs,
                          @Value("${app.base-url}") String baseUrl) {
        this.portfolioRepository = pr;
        this.fileRepository = fr;
        this.userRepository = ur;
        this.vaultSageService = vs;
        this.baseUrl = baseUrl;
    }

    @Transactional
    public PublishResponse publish(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);

        if (portfolio.getShareCode() != null)
            return new PublishResponse(portfolio.getShareCode(), buildShareUrl(portfolio.getShareCode()));

        List<PortfolioFile> files = fileRepository.findByPortfolioOrderByCreatedAtAsc(portfolio);
        if (files.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload files before publishing");

        String[] fileIds = files.stream().map(PortfolioFile::getVaultsageFileId).toArray(String[]::new);
        Map<String, String> shareInfo = vaultSageService.createShare(fileIds);

        portfolio.setShareCode(shareInfo.get("shareCode"));
        portfolio.setVaultsageShareId(shareInfo.get("shareId"));
        portfolio.setPublished(true);
        portfolioRepository.save(portfolio);

        return new PublishResponse(portfolio.getShareCode(), buildShareUrl(portfolio.getShareCode()));
    }

    public String buildShareUrl(String shareCode) {
        return baseUrl + "/p/" + shareCode;
    }

    public String getVisitorLogs(String userEmail, UUID portfolioId) {
        Portfolio portfolio = getPortfolioForUser(userEmail, portfolioId);
        if (portfolio.getVaultsageShareId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio not published yet");
        return vaultSageService.getAccessLogs(portfolio.getVaultsageShareId());
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

- [ ] **Step 5: Add publish and visitor endpoints to `PortfolioController.java`**

Add these fields and methods to the existing `PortfolioController`:

```java
// Add field:
private final PublishService publishService;

// Add methods:
@PostMapping("/{id}/publish")
public PublishResponse publish(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
    return publishService.publish(user.getUsername(), id);
}

@GetMapping("/{id}/visitors")
public String visitors(@AuthenticationPrincipal UserDetails user, @PathVariable UUID id) {
    return publishService.getVisitorLogs(user.getUsername(), id);
}
```

- [ ] **Step 6: Run test**

```bash
./gradlew test --tests "*.PublishServiceTest"
```

Expected: `1 test completed, 0 failures`

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: publish flow with VaultSage share API"
```

---

## Task 2: Certificate PDF Generation

**Files:**
- Create: `src/main/java/com/foliosage/service/CertificateService.java`
- Add endpoint to: `src/main/java/com/foliosage/controller/PortfolioController.java`
- Test: `src/test/java/com/foliosage/service/CertificateServiceTest.java`

- [ ] **Step 1: Write failing test**

```java
package com.foliosage.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class CertificateServiceTest {

    @Test
    void generatePdf_returnsPdfBytes() throws Exception {
        CertificateService service = new CertificateService(null, null, null);
        byte[] pdf = service.buildPdf(
                "design.pdf",
                "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                "file-abc123",
                java.time.LocalDateTime.of(2026, 4, 19, 10, 30, 0),
                "John Designer"
        );
        assertThat(pdf).isNotEmpty();
        // PDF files start with %PDF
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
./gradlew test --tests "*.CertificateServiceTest"
```

Expected: FAIL — `CertificateService` not found

- [ ] **Step 3: Create `CertificateService.java`**

```java
package com.foliosage.service;

import com.foliosage.entity.Certificate;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.CertificateRepository;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final PortfolioFileRepository fileRepository;
    private final PortfolioRepository portfolioRepository;

    public byte[] generateForFile(String userEmail, UUID portfolioId, UUID fileId) throws Exception {
        PortfolioFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getPortfolio().getId().equals(portfolioId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        if (!file.getPortfolio().getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        return buildPdf(
                file.getName(),
                file.getFileHash(),
                file.getVaultsageFileId(),
                file.getCertifiedAt(),
                file.getPortfolio().getUser().getName()
        );
    }

    public byte[] buildPdf(String filename, String hash, String vaultsageId,
                           LocalDateTime certifiedAt, String creatorName) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float w = PDRectangle.A4.getWidth();
                float h = PDRectangle.A4.getHeight();

                // Background
                cs.setNonStrokingColor(new PDColor(new float[]{0.98f, 0.96f, 1.0f}, PDDeviceRGB.INSTANCE));
                cs.addRect(0, 0, w, h);
                cs.fill();

                // Purple header bar
                cs.setNonStrokingColor(new PDColor(new float[]{0.49f, 0.36f, 0.94f}, PDDeviceRGB.INSTANCE));
                cs.addRect(0, h - 100, w, 100);
                cs.fill();

                // Title
                cs.setNonStrokingColor(new PDColor(new float[]{1f, 1f, 1f}, PDDeviceRGB.INSTANCE));
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 24);
                cs.newLineAtOffset(50, h - 55);
                cs.showText("FolioSage Creation Certificate");
                cs.endText();

                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.newLineAtOffset(50, h - 80);
                cs.showText("Proof of Original Creation");
                cs.endText();

                // Body
                cs.setNonStrokingColor(new PDColor(new float[]{0.1f, 0.1f, 0.1f}, PDDeviceRGB.INSTANCE));

                String[] labels = { "Creator", "File Name", "Certified At", "SHA-256 Hash", "VaultSage File ID" };
                String[] values = {
                    creatorName,
                    filename,
                    certifiedAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " UTC",
                    hash,
                    vaultsageId
                };

                float y = h - 150;
                for (int i = 0; i < labels.length; i++) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText(labels[i] + ":");
                    cs.endText();

                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                    cs.newLineAtOffset(160, y);
                    String val = values[i].length() > 64 ? values[i].substring(0, 64) : values[i];
                    cs.showText(val);
                    cs.endText();

                    if (labels[i].equals("SHA-256 Hash") && values[i].length() > 64) {
                        cs.beginText();
                        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                        cs.newLineAtOffset(160, y - 14);
                        cs.showText(values[i].substring(64));
                        cs.endText();
                        y -= 14;
                    }

                    y -= 30;
                }

                // Footer
                cs.setNonStrokingColor(new PDColor(new float[]{0.49f, 0.36f, 0.94f}, PDDeviceRGB.INSTANCE));
                cs.addRect(0, 0, w, 40);
                cs.fill();

                cs.setNonStrokingColor(new PDColor(new float[]{1f, 1f, 1f}, PDDeviceRGB.INSTANCE));
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                cs.newLineAtOffset(50, 15);
                cs.showText("Generated by FolioSage · Powered by VaultSage API · foliosage.app");
                cs.endText();
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }
}
```

- [ ] **Step 4: Add certificate endpoint to `PortfolioController.java`**

```java
// Add field:
private final CertificateService certificateService;

// Add method:
@GetMapping("/{id}/certificates/{fileId}/download")
public ResponseEntity<byte[]> downloadCertificate(
        @AuthenticationPrincipal UserDetails user,
        @PathVariable UUID id,
        @PathVariable UUID fileId) throws Exception {
    byte[] pdf = certificateService.generateForFile(user.getUsername(), id, fileId);
    return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header("Content-Disposition", "attachment; filename=\"certificate.pdf\"")
            .body(pdf);
}
```

- [ ] **Step 5: Run test**

```bash
./gradlew test --tests "*.CertificateServiceTest"
```

Expected: `1 test completed, 0 failures`

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: creation certificate PDF generation with PDFBox"
```

---

## Task 3: Public Portfolio Controller

**Files:**
- Create: `src/main/java/com/foliosage/dto/portfolio/ChatRequest.java`
- Create: `src/main/java/com/foliosage/dto/portfolio/ChatResponse.java`
- Create: `src/main/java/com/foliosage/controller/PublicController.java`

- [ ] **Step 1: Create DTOs**

```java
// ChatRequest.java
package com.foliosage.dto.portfolio;
import jakarta.validation.constraints.NotBlank;
public record ChatRequest(@NotBlank String message, String conversationId) {}
```

```java
// ChatResponse.java
package com.foliosage.dto.portfolio;
public record ChatResponse(String message, String conversationId, String role) {}
```

- [ ] **Step 2: Create `PublicController.java`**

```java
package com.foliosage.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.portfolio.*;
import com.foliosage.entity.Portfolio;
import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import com.foliosage.service.VaultSageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioFileRepository fileRepository;
    private final VaultSageService vaultSageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/{shareCode}")
    public PortfolioResponse getPublicPortfolio(@PathVariable String shareCode) {
        Portfolio portfolio = portfolioRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.isPublished())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found");

        List<PortfolioResponse.PortfolioFileDto> files = fileRepository
                .findByPortfolioOrderByCreatedAtAsc(portfolio).stream()
                .map(f -> new PortfolioResponse.PortfolioFileDto(
                        f.getId(), f.getName(), f.getVaultsageFileId(),
                        f.getFileHash(), f.getMimeType(), f.getCertifiedAt()))
                .toList();

        return new PortfolioResponse(
                portfolio.getId(), portfolio.getTitle(), portfolio.getDescription(),
                portfolio.getOrganizerId(), portfolio.getShareCode(),
                portfolio.isPublished(), portfolio.getCreatedAt(), files);
    }

    @PostMapping("/{shareCode}/chat")
    public ChatResponse chat(@PathVariable String shareCode,
                             @Valid @RequestBody ChatRequest req) {
        portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        String raw = vaultSageService.publicChat(shareCode, req.message(), req.conversationId());
        try {
            JsonNode node = objectMapper.readTree(raw);
            String message = node.path("message").asText(
                    node.path("content").asText(node.path("response").asText("")));
            String convId = node.path("conversation_id").asText(
                    node.path("id").asText(""));
            return new ChatResponse(message, convId, "assistant");
        } catch (Exception e) {
            return new ChatResponse(raw, null, "assistant");
        }
    }

    @GetMapping("/{shareCode}/chat/history")
    public String chatHistory(@PathVariable String shareCode) {
        portfolioRepository.findByShareCode(shareCode)
                .filter(Portfolio::isPublished)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        return vaultSageService.getPublicChatHistory(shareCode);
    }
}
```

- [ ] **Step 3: Compile**

```bash
./gradlew compileJava
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: public portfolio and chat endpoints"
```

---

## Task 4: Public Portfolio Frontend

**Files:**
- Create: `foliosage-frontend/components/ChatPanel.tsx`
- Create: `foliosage-frontend/components/CertificateBadge.tsx`
- Create: `foliosage-frontend/app/p/[shareCode]/page.tsx`

- [ ] **Step 1: Create `components/ChatPanel.tsx`**

```typescript
'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

interface Message { role: 'user' | 'assistant'; content: string }

interface Props { shareCode: string }

export default function ChatPanel({ shareCode }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about this portfolio 👋' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const { data } = await api.post(`/api/public/${shareCode}/chat`, {
        message: userMessage,
        conversationId,
      })
      if (data.conversationId) setConversationId(data.conversationId)
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble answering that. Please try again.'
      }])
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-600 to-pink-500">
        <p className="text-white font-semibold text-sm">💬 Ask about this portfolio</p>
        <p className="text-purple-100 text-xs">Powered by VaultSage AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a question..."
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={send} disabled={loading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700 px-4">
          →
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/CertificateBadge.tsx`**

```typescript
interface Props {
  fileId: string
  portfolioId: string
  filename: string
  fileHash: string
  certifiedAt: string
}

export default function CertificateBadge({ fileId, portfolioId, filename, fileHash, certifiedAt }: Props) {
  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/portfolios/${portfolioId}/certificates/${fileId}/download`

  return (
    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📜</span>
        <div>
          <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{filename}</p>
          <p className="text-xs text-slate-400 font-mono">{fileHash.slice(0, 12)}...</p>
          <p className="text-xs text-slate-400">{new Date(certifiedAt).toLocaleDateString()}</p>
        </div>
      </div>
      <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
        <button className="text-xs text-purple-600 border border-purple-300 rounded-lg px-3 py-1.5 hover:bg-purple-100 transition-colors">
          Download PDF
        </button>
      </a>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/p/[shareCode]/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import ChatPanel from '@/components/ChatPanel'
import CertificateBadge from '@/components/CertificateBadge'
import api from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export default function PublicPortfolioPage() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [showCerts, setShowCerts] = useState(false)

  useEffect(() => {
    api.get(`/api/public/${shareCode}`)
      .then(r => { setPortfolio(r.data); setSelectedFile(r.data.files?.[0] ?? null) })
      .catch(() => setError('This portfolio could not be found.'))
  }, [shareCode])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-slate-500">{error}</p>
      </div>
    </div>
  )

  if (!portfolio) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-4xl">⟳</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-purple-300 text-sm mb-1">FolioSage Portfolio</p>
            <h1 className="text-2xl font-bold">{portfolio.title}</h1>
            {portfolio.description && <p className="text-purple-200 text-sm mt-1">{portfolio.description}</p>}
          </div>
          <button
            className="text-sm border border-purple-400 rounded-lg px-4 py-2 hover:bg-purple-800 transition-colors"
            onClick={() => setShowCerts(!showCerts)}
          >
            📜 {showCerts ? 'Hide' : 'View'} Certificates
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {showCerts && portfolio.files?.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolio.files.map((f: any) => (
              <CertificateBadge
                key={f.id}
                fileId={f.id}
                portfolioId={portfolio.id}
                filename={f.name}
                fileHash={f.fileHash}
                certifiedAt={f.certifiedAt}
              />
            ))}
          </div>
        )}

        <div className="flex gap-6 h-[calc(100vh-260px)]">
          {/* Gallery Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Selected file preview */}
            {selectedFile && (
              <div className="flex-1 bg-white rounded-2xl border overflow-hidden mb-3">
                <img
                  src={`${API_URL}/api/portfolios/preview/${selectedFile.vaultsageFileId}`}
                  alt={selectedFile.name}
                  className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}

            {/* File thumbnail strip */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {portfolio.files?.map((f: any) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFile(f)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                    selectedFile?.id === f.id ? 'border-purple-500 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={`${API_URL}/api/portfolios/preview/${f.vaultsageFileId}`}
                    alt={f.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                      img.parentElement!.textContent = '📁'
                    }}
                  />
                </button>
              ))}
            </div>

            {selectedFile && (
              <p className="text-xs text-slate-400 mt-2 text-center">{selectedFile.name}</p>
            )}
          </div>

          {/* Chat Panel */}
          <div className="w-80 flex-shrink-0">
            <ChatPanel shareCode={shareCode} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Start servers and verify public portfolio**

```bash
# Terminal 1
cd foliosage-backend && VAULTSAGE_API_KEY=your-key ./gradlew bootRun

# Terminal 2
cd foliosage-frontend && npm run dev
```

1. Log in → create portfolio → upload files
2. Click "Publish Portfolio" → copy share URL
3. Open share URL in incognito → public page loads with gallery and chat
4. Type a message in chat → AI responds based on portfolio files
5. Click "View Certificates" → certificate badges appear
6. Click "Download PDF" → certificate PDF downloads

- [ ] **Step 5: Commit**

```bash
cd foliosage-frontend
git add .
git commit -m "feat: public portfolio page with gallery and AI chat"
```

---

## Task 5: AWS Deployment — Backend

- [ ] **Step 1: Build JAR**

```bash
cd foliosage-backend
./gradlew clean build -x test
```

Expected: `build/libs/foliosage-backend-0.0.1-SNAPSHOT.jar` created

- [ ] **Step 2: Create RDS PostgreSQL instance**

1. AWS Console → RDS → Create Database
2. Engine: PostgreSQL 16, Template: Free tier
3. DB identifier: `foliosage-db`
4. Master username: `foliosage`, set a password
5. VPC: default, Public access: Yes
6. Initial DB name: `foliosage`
7. Note the endpoint after creation: `foliosage-db.xxxx.ap-northeast-2.rds.amazonaws.com`

- [ ] **Step 3: Create Elastic Beanstalk application**

1. AWS Console → Elastic Beanstalk → Create Application
2. Application name: `foliosage-backend`
3. Platform: Java 21 (Corretto 21)
4. Upload: `build/libs/foliosage-backend-0.0.1-SNAPSHOT.jar`

- [ ] **Step 4: Set Elastic Beanstalk environment variables**

Go to Configuration → Software → Environment properties:

```
DB_URL=jdbc:postgresql://<RDS_ENDPOINT>:5432/foliosage
DB_USERNAME=foliosage
DB_PASSWORD=<your_rds_password>
JWT_SECRET=<run: openssl rand -base64 48>
VAULTSAGE_API_KEY=<your_key>
VAULTSAGE_BASE_URL=https://api.vaultsage.ai
CORS_ORIGINS=https://<your-app>.vercel.app
APP_BASE_URL=https://<your-app>.vercel.app
```

- [ ] **Step 5: Verify backend is live**

```bash
curl https://<your-beanstalk-url>/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","name":"Test"}'
```

Expected: `{"token":"...","email":"test@test.com","name":"Test"}`

- [ ] **Step 6: Commit deployment notes**

```bash
echo "BEANSTALK_URL=<your-url>\nRDS_ENDPOINT=<your-rds>" > DEPLOY.md
git add DEPLOY.md
git commit -m "docs: deployment info"
```

---

## Task 6: Vercel Frontend Deployment

- [ ] **Step 1: Push frontend to GitHub**

```bash
cd foliosage-frontend
git remote add origin https://github.com/<your-username>/foliosage-frontend.git
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select `foliosage-frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = `https://<your-beanstalk-url>`
4. Click Deploy

- [ ] **Step 3: Update backend CORS with Vercel URL**

In Elastic Beanstalk environment properties update:

```
CORS_ORIGINS=https://<your-app>.vercel.app
APP_BASE_URL=https://<your-app>.vercel.app
```

- [ ] **Step 4: End-to-end production smoke test**

1. Open `https://<your-app>.vercel.app`
2. Sign up → create portfolio → upload 3+ files
3. Start AI Organize → wait for "Organization complete!"
4. Publish → copy share URL → open in incognito
5. Verify gallery renders with PNG previews
6. Chat: "What kind of work is in this portfolio?" → AI responds
7. Download a certificate PDF → verify it opens with correct file hash

---

## Plan 3 Complete

- ✅ Publish flow — VaultSage Share API + share URL stored in DB
- ✅ Creation certificate — Apache PDFBox PDF with hash, timestamp, creator
- ✅ Public portfolio endpoint — gallery data + chat proxy
- ✅ Public chat — VaultSage `chat/public` API
- ✅ Public portfolio page — gallery + thumbnail strip + AI chat panel
- ✅ Certificate badges with PDF download
- ✅ Backend deployed to AWS Elastic Beanstalk
- ✅ Frontend deployed to Vercel
- ✅ Full end-to-end production flow verified

---

## Competition Submission Checklist

- [ ] Register at https://forms.gle/C3592Ju5k9ELdEoCA (deadline: April 30, 2026)
- [ ] Submit project link at https://forms.gle/vvdMepK43uDxPVop9 (deadline: May 25, 2026)
- [ ] Post on social media with `#vaultsage` hashtag
- [ ] Contact: ai@nurie.ai for support
