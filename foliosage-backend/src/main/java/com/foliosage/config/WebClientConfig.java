package com.foliosage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${vaultsage.base-url}") private String baseUrl;
    @Value("${vaultsage.api-key}")  private String apiKey;

    @Bean
    public WebClient vaultSageClient() {
        if (!org.springframework.util.StringUtils.hasText(apiKey))
            throw new IllegalStateException("vaultsage.api-key must be configured");
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(50 * 1024 * 1024))
                .build();
    }
}
