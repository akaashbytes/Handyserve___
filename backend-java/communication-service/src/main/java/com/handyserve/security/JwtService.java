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

    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiryMs))
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiryMs))
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public Date extractExpiry(String token) {
        return parseClaims(token).getExpiration();
    }

    public boolean validateAccessToken(String token) {
        parseClaims(token);
        return true;
    }

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

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

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
