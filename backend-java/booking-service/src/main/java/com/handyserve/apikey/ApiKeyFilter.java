package com.handyserve.apikey;

import com.handyserve.entity.ApiKey;
import com.handyserve.repository.oracle.ApiKeyRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Validates the X-Api-Key header on every incoming HTTP request.
 *
 * PUBLIC endpoints (login, register, public-stats, providers GET, nominatim, contact POST,
 * WS handshake, actuator) are allowed through WITHOUT a key.
 *
 * All other requests MUST carry a valid X-Api-Key header that exists in HS_API_KEYS.
 * An invalid / missing key returns HTTP 401 with a JSON error body.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class ApiKeyFilter implements Filter {

    private static final String HEADER_NAME = "X-Api-Key";

    private final ApiKeyRepository apiKeyRepository;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String path   = req.getRequestURI();
        String method = req.getMethod();

        // ── Pre-flight CORS: always pass ──────────────────────────
        if ("OPTIONS".equalsIgnoreCase(method)) {
            chain.doFilter(request, response);
            return;
        }

        // ── Public paths: skip key check ──────────────────────────
        if (isPublicPath(method, path)) {
            chain.doFilter(request, response);
            return;
        }

        // ── Read the API key header ───────────────────────────────
        String rawKey = req.getHeader(HEADER_NAME);

        if (rawKey == null || rawKey.isBlank()) {
            sendUnauthorized(res, "Missing X-Api-Key header. Every API call requires its designated API key.");
            return;
        }

        // ── Validate against DB ───────────────────────────────────
        ApiKey apiKey = apiKeyRepository.findByKeyValueAndActiveTrue(rawKey.trim()).orElse(null);

        if (apiKey == null) {
            log.warn("[API-KEY] REJECTED {} {} — key not found: {}...{}",
                     method, path, rawKey.substring(0, Math.min(8, rawKey.length())),
                     rawKey.substring(Math.max(0, rawKey.length() - 4)));
            sendUnauthorized(res, "Invalid API key: " + rawKey.substring(0, Math.min(10, rawKey.length())) + "...");
            return;
        }

        // ── Attach metadata to request for downstream logging ─────
        req.setAttribute("apiKeyId", apiKey.getApiIdentifier());
        req.setAttribute("apiFeature", apiKey.getFeatureName());

        log.info("[API-KEY] ✓ {} {} → [{}] {}", method, path, apiKey.getApiIdentifier(), apiKey.getFeatureName());

        chain.doFilter(request, response);
    }

    // ─────────────────────────────────────────────────────────────
    // Paths that do NOT require an API key
    // ─────────────────────────────────────────────────────────────
    private boolean isPublicPath(String method, String path) {
        // Auth public endpoints
        if (path.equals("/api/auth/login"))         return true;
        if (path.equals("/api/auth/register"))      return true;
        if (path.equals("/api/auth/verify-otp"))    return true;
        if (path.equals("/api/auth/resend-otp"))    return true;
        if (path.equals("/api/auth/refresh"))       return true;
        if (path.equals("/api/auth/public-stats"))  return true;
        if (path.equals("/error"))                  return true;

        // Contact form submit (public)
        if ("POST".equalsIgnoreCase(method) && path.equals("/api/contact")) return true;

        // Provider listing (public search)
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/providers")) return true;

        // Nominatim geocoding proxy
        if (path.startsWith("/api/nominatim")) return true;

        // WebSocket handshake
        if (path.startsWith("/ws"))           return true;

        // Spring Actuator
        if (path.startsWith("/actuator"))     return true;

        // Swagger UI + OpenAPI docs
        if (path.startsWith("/swagger-ui"))   return true;
        if (path.startsWith("/v3/api-docs"))  return true;

        return false;
    }

    // ─────────────────────────────────────────────────────────────
    private void sendUnauthorized(HttpServletResponse res, String message) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write(
            "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" + message + "\"}"
        );
    }
}
