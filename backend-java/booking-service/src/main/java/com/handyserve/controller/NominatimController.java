package com.handyserve.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/nominatim")
public class NominatimController {

    private static final Logger log = LoggerFactory.getLogger(NominatimController.class);
    private final WebClient nominatimWebClient;

    // Removed hardcoded mock location data; real geocoding service will be used.
    // Note: If external service is unavailable, the API returns HTTP 503 with an error message.

    public NominatimController(WebClient nominatimWebClient) {
        this.nominatimWebClient = nominatimWebClient;
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "json") String format,
            @RequestParam(defaultValue = "6") Integer limit,
            @RequestParam(name = "addressdetails", defaultValue = "1") Integer addressDetails,
            @RequestParam(name = "countrycodes", defaultValue = "in") String countryCodes) {

        log.info("[Nominatim] Geocoding request received for query: '{}'", q);

        return nominatimWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", q)
                        .queryParam("format", format)
                        .queryParam("limit", limit)
                        .queryParam("addressdetails", addressDetails)
                        .queryParam("countrycodes", countryCodes)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    log.info("[Nominatim] Successfully retrieved geocoding data from OpenStreetMap.");
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(e -> {
                    log.warn("[Nominatim] Failed to fetch from OpenStreetMap (unreachable or rate-limited: {}). Returning error.", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                            .body("{\"error\":\"Geocoding service unavailable\"}"));
                });
    }
}
