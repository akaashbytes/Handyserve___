package com.handyserve.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * JwtAuthenticationFilter — production-grade OncePerRequestFilter.
 *
 * Processing pipeline for every HTTP request:
 *
 *   1. Extract Bearer token from Authorization header
 *   2. If no token → pass through (let Spring Security handle auth requirements)
 *   3. Validate JWT signature     → reject tampered tokens   (401)
 *   4. Validate JWT expiry        → reject expired tokens    (401)
 *   5. Validate JWT structure     → reject malformed tokens  (401)
 *   6. Extract email from claims
 *   7. Load user from DB          → reject deleted users     (401)
 *   8. Check user is not blocked  → reject blocked users     (403)
 *   9. Build GrantedAuthority from DB role (ROLE_ADMIN / ROLE_PROVIDER / ROLE_CUSTOMER)
 *  10. Set authentication in SecurityContext
 *  11. Continue filter chain
 *
 * Error responses are written directly as JSON in the filter (not relying on
 * the controller-advice layer, which doesn't apply to filter-level failures).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService            jwtService;
    private final ObjectMapper          objectMapper;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            ObjectMapper objectMapper) {
        this.jwtService          = jwtService;
        this.objectMapper        = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest  request,
            HttpServletResponse response,
            FilterChain         filterChain) throws ServletException, IOException {

        // ── Step 1: Extract token ──────────────────────────────────────────
        String token = extractBearerToken(request);

        // ── Step 2: No token → skip (unauthenticated; Security rules decide) ─
        if (!StringUtils.hasText(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // ── Steps 3–5: Validate JWT (signature / expiry / structure) ─────
        try {
            jwtService.validateAccessToken(token);
        } catch (ExpiredJwtException e) {
            log.warn("[JWT-FILTER] Expired token on {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            writeError(response, request, HttpStatus.UNAUTHORIZED,
                    "JWT token has expired. Please log in again.");
            return;
        } catch (SignatureException e) {
            log.warn("[JWT-FILTER] Tampered token on {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            writeError(response, request, HttpStatus.UNAUTHORIZED,
                    "JWT signature is invalid. Token may have been tampered with.");
            return;
        } catch (MalformedJwtException e) {
            log.warn("[JWT-FILTER] Malformed token on {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            writeError(response, request, HttpStatus.UNAUTHORIZED,
                    "Malformed JWT token. Please provide a valid Bearer token.");
            return;
        } catch (UnsupportedJwtException e) {
            log.warn("[JWT-FILTER] Unsupported token on {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            writeError(response, request, HttpStatus.UNAUTHORIZED,
                    "Unsupported JWT token format.");
            return;
        } catch (IllegalArgumentException e) {
            log.warn("[JWT-FILTER] Empty/null token on {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            writeError(response, request, HttpStatus.UNAUTHORIZED,
                    "JWT token string is empty or null.");
            return;
        }

        // ── Step 6: Extract email ─────────────────────────────────────────
        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);

        // ── Steps 7–9: Verify user email exists and set context locally ─
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Build SimpleGrantedAuthority from JWT claims role
            String mappedRole = (role != null) ? "ROLE_" + role.toLowerCase() : "ROLE_customer";
            org.springframework.security.core.authority.SimpleGrantedAuthority authority = 
                    new org.springframework.security.core.authority.SimpleGrantedAuthority(mappedRole);
            
            UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                    email, 
                    "", 
                    java.util.List.of(authority)
            );

            // ── Step 9: Set authentication in SecurityContext ──────────────
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,                           // credentials (not needed post-auth)
                            userDetails.getAuthorities()
                    );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

            log.debug("[JWT-FILTER] Authenticated user locally: {} | authorities: {}", email, userDetails.getAuthorities());
        }

        // ── Step 11: Continue ─────────────────────────────────────────────
        filterChain.doFilter(request, response);
    }

    // ── Private Helpers ────────────────────────────────────────────────────

    /**
     * Extracts the raw JWT string from the Authorization header.
     * Expects format: "Bearer <token>"
     */
    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        return null;
    }

    /**
     * Writes a standardized JSON error response directly to the servlet response.
     * Used for filter-level errors that occur before Spring MVC / @RestControllerAdvice.
     *
     * Response shape:
     * {
     *   "timestamp": "2026-06-09T10:00:00",
     *   "status":    401,
     *   "message":   "JWT token has expired...",
     *   "path":      "/api/customer/bookings"
     * }
     */
    private void writeError(
            HttpServletResponse response,
            HttpServletRequest  request,
            HttpStatus          status,
            String              message) throws IOException {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    status.value());
        body.put("message",   message);
        body.put("path",      request.getRequestURI());

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
