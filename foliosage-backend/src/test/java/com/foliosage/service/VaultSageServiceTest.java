package com.foliosage.service;

import org.junit.jupiter.api.Test;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
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

    @Test
    void unwrapSingleFileDownload_extractsFileBytesFromZip() throws Exception {
        byte[] pdf = "%PDF-1.7\nsample".getBytes(StandardCharsets.UTF_8);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(out)) {
            zos.putNextEntry(new ZipEntry("design.pdf"));
            zos.write(pdf);
            zos.closeEntry();
        }

        VaultSageService service = new VaultSageService(null);
        assertThat(service.unwrapSingleFileDownload(out.toByteArray(), "file-abc123")).isEqualTo(pdf);
    }

    @Test
    void unwrapSingleFileDownload_keepsRawBytesWhenNotZip() {
        byte[] pdf = "%PDF-1.7\nsample".getBytes(StandardCharsets.UTF_8);
        VaultSageService service = new VaultSageService(null);
        assertThat(service.unwrapSingleFileDownload(pdf, "file-abc123")).isEqualTo(pdf);
    }
}
