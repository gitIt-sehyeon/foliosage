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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service @Slf4j @RequiredArgsConstructor
public class VaultSageService {

    private final WebClient vaultSageClient;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // ── Files ──────────────────────────────────────────────────────────

    public String uploadFile(byte[] bytes, String filename, String contentType, String directoryId) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("files", new ByteArrayResource(bytes) {
            @Override public String getFilename() { return filename; }
        }).contentType(MediaType.parseMediaType(contentType));

        String response = vaultSageClient.post()
                .uri(u -> u.path("/api/v1/files/")
                        .queryParam("conflict_resolution", "keep")
                        .queryParam("directory_id", directoryId)
                        .build())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        if (response == null) throw new RuntimeException("Empty response from VaultSage");
        return extractFileId(response);
    }

    public String createDirectory(String name) {
        String response = vaultSageClient.post()
                .uri("/api/v1/directories/")
                .bodyValue(Map.of("directory_name", name))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        if (response == null) throw new RuntimeException("Empty response from VaultSage");
        try {
            return objectMapper.readTree(response).path("directory_id").asText();
        } catch (Exception e) { throw new RuntimeException("Failed to parse directory ID", e); }
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
            JsonNode items = root.path("result");
            for (JsonNode item : items) {
                if (fileId.equals(item.path("file_id").asText()))
                    return item.path("task_summary_status").asText("processing");
            }
            return "processing";
        } catch (Exception e) { log.error("Failed to parse processing status", e); return "processing"; }
    }

    public void requestPngPreview(String fileId) {
        vaultSageClient.post()
                .uri("/api/v1/files/png-preview-reprocess/{id}", fileId)
                .retrieve()
                .bodyToMono(String.class)
                .subscribe(null, e -> log.debug("png-preview-reprocess ignored: {}", e.getMessage()));
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
        if (response == null) throw new RuntimeException("Empty response from VaultSage");
        return extractId(response);
    }

    public String generateTree(String organizerId) {
        String response = vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{id}/generate", organizerId)
                .bodyValue(Map.of("replace", true))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractJobId(response);
    }

    public String getGenerateStatus(String organizerId, String jobId) {
        String response = vaultSageClient.get()
                .uri(u -> u.path("/api/v1/smart-organizers/{id}/generate/status")
                        .queryParam("job_id", jobId).build(organizerId))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractStatus(response);
    }

    public String applyOrganizer(String organizerId) {
        String response = vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{id}/apply", organizerId)
                .bodyValue(Map.of())
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractJobId(response);
    }

    public String getApplyProgress(String organizerId, String jobId) {
        String response = vaultSageClient.get()
                .uri(u -> u.path("/api/v1/smart-organizers/{id}/apply/progress")
                        .queryParam("job_id", jobId).build(organizerId))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractStatus(response);
    }

    public String materialize(String organizerId) {
        String response = vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{id}/materialize", organizerId)
                .bodyValue(Map.of())
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractJobId(response);
    }

    public String getMaterializeStatus(String organizerId, String jobId) {
        String response = vaultSageClient.get()
                .uri(u -> u.path("/api/v1/smart-organizers/{id}/materialize/status")
                        .queryParam("job_id", jobId).build(organizerId))
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

    public String createNode(String organizerId, String name) {
        String response = vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{id}/nodes", organizerId)
                .bodyValue(Map.of("name", name, "order_index", 0))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        if (response == null) throw new RuntimeException("Empty response from VaultSage");
        try {
            return objectMapper.readTree(response).path("id").asText();
        } catch (Exception e) { throw new RuntimeException("Failed to parse node ID", e); }
    }

    public void assignFilesToNode(String organizerId, String nodeId, List<String> fileIds) {
        vaultSageClient.post()
                .uri("/api/v1/smart-organizers/{orgId}/nodes/{nodeId}/files:assign",
                        organizerId, nodeId)
                .bodyValue(Map.of("file_ids", fileIds))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    // ── Share ──────────────────────────────────────────────────────────

    public String createShare(String[] fileIds) {
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("file_ids", java.util.Arrays.asList(fileIds));
        body.put("directory_ids", null);
        body.put("emails", null);
        body.put("message", null);
        body.put("password", null);
        body.put("expire_at", null);
        String response = vaultSageClient.post()
                .uri("/api/v1/share/")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        if (response == null) return "";
        String raw = response.replaceAll("^\"|\"$", "").trim();
        // VaultSage returns full URL like https://vaultsage.ai/shares?code=Ibw8GP4y
        int codeIdx = raw.indexOf("code=");
        if (codeIdx >= 0) return raw.substring(codeIdx + 5);
        return raw;
    }

    public String getAccessLogs(String shareId) {
        return vaultSageClient.get()
                .uri("/api/v1/share/access-logs/{id}", shareId)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    // ── Chat ───────────────────────────────────────────────────────────

    public String publicChat(String shareCode, String message, String conversationId, String sessionId) {
        Map<String, Object> body = new HashMap<>();
        body.put("share_code", shareCode);
        body.put("message", message);
        body.put("session_id", sessionId != null ? sessionId : UUID.randomUUID().toString());
        if (conversationId != null) body.put("conversation_id", conversationId);
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
            JsonNode item = root.isArray() ? root.get(0) : root;
            return item.path("file_id").asText();
        } catch (Exception e) { throw new RuntimeException("Failed to parse file ID", e); }
    }

    public String extractId(String json) {
        try { return objectMapper.readTree(json).path("id").asText(); }
        catch (Exception e) { throw new RuntimeException("Failed to parse ID", e); }
    }

    private String extractJobId(String json) {
        try { return objectMapper.readTree(json).path("job_id").asText(); }
        catch (Exception e) { throw new RuntimeException("Failed to parse job_id", e); }
    }

    private String extractStatus(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            String status = node.path("status").asText("");
            if (!status.isEmpty()) return status.toLowerCase();
            // apply/progress may not have "status" — check for completion via progress fields
            if (node.has("progress") && node.has("total")) {
                int progress = node.path("progress").asInt(0);
                int total = node.path("total").asInt(1); // default 1 prevents false 0>=0 completion when total is absent
                if (total > 0 && progress >= total) return "completed";
            }
            return "pending";
        } catch (Exception e) { log.warn("Failed to parse status from: {}", json, e); return "pending"; }
    }
}
