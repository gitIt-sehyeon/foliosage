package com.foliosage.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class PublishServiceTest {

    @Test
    void buildShareUrl_appendsShareCodeToBaseUrl() {
        PublishService service = new PublishService(null, null, null, "https://foliosage.app");
        String url = service.buildShareUrl("abc123");
        assertThat(url).isEqualTo("https://foliosage.app/p/abc123");
    }
}
