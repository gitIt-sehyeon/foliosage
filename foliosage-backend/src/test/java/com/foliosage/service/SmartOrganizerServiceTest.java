package com.foliosage.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SmartOrganizerServiceTest {

    SmartOrganizerService service;

    @BeforeEach
    void setUp() {
        service = new SmartOrganizerService(
            mock(com.foliosage.repository.PortfolioRepository.class),
            mock(com.foliosage.repository.PortfolioFileRepository.class)
        );
    }

    @ParameterizedTest
    @CsvSource({
        "Color tokens.json,       application/json, system",
        "Design system guide.pdf, application/pdf,  system",
        "component-spec.tsx,      text/plain,       system",
        "Hero key visual.png,     image/png,        visual",
        "Microsite hifi.fig,      application/octet-stream, visual",
        "moodboard.jpg,           image/jpeg,       visual",
        "Process journal.md,      text/markdown,    document",
        "Research notes.pdf,      application/pdf,  document",
        "Brief.docx,              application/vnd.openxmlformats, document",
        "Final delivery.zip,      application/zip,  deliverable",
        "Assets final.tar.gz,     application/gzip, deliverable",
        "final-export.png,        image/png,        deliverable",
    })
    void classifyByExtensionAndName_returnsExpectedCategory(String name, String mime, String expected) {
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : "";
        String result = service.classifyByExtensionAndName(name, ext, mime);
        assertThat(result).isEqualTo(expected);
    }

    @Test
    void calculateConfidence_returnsHighForPerfectExtensionMatch() {
        assertThat(service.calculateConfidence("tokens.json", "json", null, "system")).isGreaterThanOrEqualTo(90);
        assertThat(service.calculateConfidence("hero.png",    "png",  "image/png", "visual")).isGreaterThanOrEqualTo(90);
        assertThat(service.calculateConfidence("brief.zip",   "zip",  "application/zip", "deliverable")).isGreaterThanOrEqualTo(90);
    }

    @Test
    void generateReasoning_containsExtensionAndCategory() {
        String r = service.generateReasoning("tokens.json", "json", "system");
        assertThat(r).contains("json");
        assertThat(r).contains("System");
    }
}
