package com.foliosage.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class CertificateServiceTest {

    @Test
    void generatePdf_returnsPdfBytes() throws Exception {
        CertificateService service = new CertificateService(null);
        byte[] pdf = service.buildPdf(
                "design.pdf",
                "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                "file-abc123",
                java.time.LocalDateTime.of(2026, 4, 19, 10, 30, 0),
                "John Designer"
        );
        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }
}
