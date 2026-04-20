package com.foliosage.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class VaultSageServiceTest {

    @Test
    void parseFileId_extractsIdFromUploadResponse() {
        String json = """
            {"file_id": "file-abc123", "name": "design.pdf", "size": 1024}
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
