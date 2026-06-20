package com.handyserve.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JwtService — production-grade JWT operations.
 *
 * Responsibilities:
 *  - Generate signed HS256 access tokens (email + role claim)
 *  - Generate signed HS256 refresh tokens (email only)
 *  - Extract email / role from any token
 *  - Validate tokens: signature integrity, expiry, structure
 *  - Throw named JWT exceptions so GlobalExceptionHandler can map each
 *    to the correct HTTP 401 response (not a blanket catch-all)
 *
 * Token format:
 *   Header  : { "alg": "HS256", "typ": "JWT" }
 *   Payload : { "sub": "<email>", "role": "<role>", "iat": ..., "exp": ... }
 *   Signature: HMAC-SHA256 with secret key (≥ 32 bytes)
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey  secretKey;
    private final long       accessTokenExpiryMs;
    private final long       refreshTokenExpiryMs;

    public JwtService(
            @Value("${jwt.secret}")                  String secret,
            @Value("${jwt.expiration-ms}")           long   accessTokenExpiryMs,
            @Value("${jwt.refresh-expiration-ms}")   long   refreshTokenExpiryMs) {

        // Ensure the raw key bytes are at least 256 bits (32 bytes) for HMAC-SHA256
        byte[] rawBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (rawBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(rawBytes, 0, padded, 0, rawBytes.length);
            rawBytes = padded;
            log.warn("[JWT] Secret is shorter than 32 bytes — padded to 32. Use a longer secret in production.");
        }

        this.secretKey            = Keys.hmacShaKeyFor(rawBytes);
        this.accessTokenExpiryMs  = accessTokenExpiryMs;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
    }

    // ── Token Generation ────────────────────────────────────────────────────

    /**
     * Generates a short-lived access token.
     *
     * @param email  Subject — uniquely identifies the user
     * @param role   Role claim — "customer" | "provider" | "admin"
     * @return signed JWT string
     */
    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiryMs))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Generates a long-lived refresh token (no role claim — role can change).
     *
     * @param email Subject — uniquely identifies the user
     * @return signed JWT string
     */
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiryMs))
                .signWith(secretKey)
                .compact();
    }

    // ── Claim Extraction ────────────────────────────────────────────────────

    /**
     * Extracts the email (subject) from a token.
     * Throws a JWT exception if token is invalid — do NOT suppress.
     */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extracts the role claim from an access token.
     * Returns null if the claim is absent (e.g. for a refresh token).
     */
    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /**
     * Extracts the expiry date from a token.
     */
    public Date extractExpiry(String token) {
        return parseClaims(token).getExpiration();
    }

    // ── Validation ──────────────────────────────────────────────────────────

    /**
     * Full validation pipeline — throws the most specific JWT exception:
     *
     *   ExpiredJwtException      → token past its exp claim
     *   SignatureException       → token tampered (signature mismatch)
     *   MalformedJwtException    → token structure is broken
     *   UnsupportedJwtException  → unsupported JWT format
     *   IllegalArgumentException → blank / null token string
     *
     * The filter catches these individually and writes a 401 JSON error response.
     * Never returns false — always throws or returns true.
     */
    public boolean validateAccessToken(String token) {
        parseClaims(token); // throws on any failure
        return true;
    }

    /**
     * Soft validation — returns true/false without throwing.
     * Used only for optional / best-effort checks (e.g., WebSocket handshake).
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("[JWT] Token expired: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("[JWT] Token signature invalid: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("[JWT] Malformed token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("[JWT] Unsupported token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("[JWT] Empty/null token: {}", e.getMessage());
        }
        return false;
    }

    // ── Internal ────────────────────────────────────────────────────────────

    /**
     * Parses and verifies token, returning its claims payload.
     * All JWT exceptions propagate as-is (not wrapped in RuntimeException).
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── Backward-compat aliases (used in UserService / refresh flow) ────────

    /** @deprecated Use {@link #generateAccessToken(String, String)} */
    @Deprecated
    public String generateAccessToken(String email, String role, Object ignored) {
        return generateAccessToken(email, role);
    }

    /** @deprecated Use {@link #extractEmail(String)} */
    @Deprecated
    public String getEmailFromToken(String token) { return extractEmail(token); }

    /** @deprecated Use {@link #extractRole(String)} */
    @Deprecated
    public String getRoleFromToken(String token) { return extractRole(token); }

    /** @deprecated Use {@link #isTokenValid(String)} */
    @Deprecated
    public boolean validateToken(String token) { return isTokenValid(token); }

    /**
     * Hashes a raw refresh token using SHA-256 before persisting it.
     */
    public String hashToken(String token) {
        if (token == null) return null;
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
