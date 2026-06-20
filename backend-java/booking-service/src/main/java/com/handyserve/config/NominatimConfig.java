package com.handyserve.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class NominatimConfig {

    @Value("${app.nominatim-base:https://nominatim.openstreetmap.org}")
    private String nominatimBaseUrl;

    @Bean
    public WebClient nominatimWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(nominatimBaseUrl)
                .defaultHeader("User-Agent", "HandyServePro/1.0 (contact@handyserve.com)")
                .build();
    }
}
