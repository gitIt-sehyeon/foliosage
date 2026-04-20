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

import java.util.List;
import java.util.Map;

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
            JsonNode items = root.isArray() ? root : root.path("items");
            for (JsonNode item : items) {
                if (fileId.equals(item.path("id").asText()))
                    return item.path("status").asText("processing");
            }
            return "processing";
        } catch (Exception e) { log.error("Failed to parse processing status", e); return "processing"; }
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
        if (response == null) throw new RuntimeException("Empty response from VaultSage");
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
        } catch (Exception e) { log.error("Failed to parse share response", e); return Map.of("shareId", "", "shareCode", ""); }
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
            JsonNode item = root.isArray() ? root.get(0) : root;
            return item.path("file_id").asText();
        } catch (Exception e) { throw new RuntimeException("Failed to parse file ID", e); }
    }

    public String extractId(String json) {
        try { return objectMapper.readTree(json).path("id").asText(); }
        catch (Exception e) { throw new RuntimeException("Failed to parse ID", e); }
    }

    private String extractStatus(String json) {
        try { return objectMapper.readTree(json).path("status").asText("pending"); }
        catch (Exception e) { log.warn("Failed to parse status from: {}", json, e); return "pending"; }
    }
}
