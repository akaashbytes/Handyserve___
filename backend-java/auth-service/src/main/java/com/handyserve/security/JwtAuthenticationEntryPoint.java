package com.handyserve.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * JwtAuthenticationEntryPoint
 *
 * Invoked by Spring Security when an unauthenticated request reaches a
 * protected endpoint — i.e., the request either had no token at all, or
 * the SecurityContext was empty after the JWT filter ran.
 *
 * Returns HTTP 401 Unauthorized with a structured JSON body instead of
 * the default HTML Spring Security error page.
 *
 * Response shape:
 * {
 *   "timestamp": "2026-06-09T10:00:00",
 *   "status":    401,
 *   "message":   "Authentication required. Please provide a valid Bearer token.",
 *   "path":      "/api/customer/bookings"
 * }
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationEntryPoint.class);

    private final ObjectMapper objectMapper;

    public JwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest      request,
            HttpServletResponse     response,
            AuthenticationException authException) throws IOException, ServletException {

        log.warn("[ENTRY-POINT] Unauthenticated access attempt on {} {} — {}",
                request.getMethod(), request.getRequestURI(), authException.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    HttpStatus.UNAUTHORIZED.value());
        body.put("message",   "Authentication required. Please provide a valid Bearer token.");
        body.put("path",      request.getRequestURI());

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
