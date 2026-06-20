package com.handyserve.config;

import com.handyserve.exception.AccessDeniedException;
import com.handyserve.exception.DuplicateUserException;
import com.handyserve.exception.ResourceNotFoundException;
import com.handyserve.exception.ValidationException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralized exception handler for all REST controllers.
 *
 * Standard error response shape:
 * {
 *   "timestamp": "2026-06-09T10:00:00",
 *   "status":    400,
 *   "message":   "Human-readable description",
 *   "path":      "/api/auth/register"
 * }
 *
 * For @Valid failures, an additional "errors" field contains per-field messages.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── 1. Bean Validation Errors ───────────────────────────────────────────

    /**
     * Handles @Valid / @Validated constraint violations on @RequestBody DTOs.
     * HTTP 400 Bad Request.
     *
     * Adds an "errors" map: { fieldName: "first violation message", ... }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        // Collect first error per field (preserves insertion order)
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (first, second) -> first,        // keep the first message per field
                        LinkedHashMap::new
                ));

        Map<String, Object> body = buildBody(
                HttpStatus.BAD_REQUEST,
                "Validation failed. Please check the submitted fields.",
                request.getRequestURI()
        );
        body.put("errors", fieldErrors);  // additional field — per-field detail

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // ── 2. Business Validation Exception ───────────────────────────────────

    /**
     * Handles our custom ValidationException — business-rule violations.
     * HTTP 400 Bad Request.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            ValidationException ex,
            HttpServletRequest request) {

        Map<String, Object> body = buildBody(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request.getRequestURI()
        );

        // Include field name if the caller provided one
        if (ex.getField() != null) {
            body.put("field", ex.getField());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // ── 3. Resource Not Found ───────────────────────────────────────────────

    /**
     * Handles ResourceNotFoundException — entity does not exist in DB.
     * HTTP 404 Not Found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(buildBody(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI()));
    }

    // ── 4. Duplicate User ──────────────────────────────────────────────────

    /**
     * Handles DuplicateUserException — email already registered.
     * HTTP 409 Conflict.
     */
    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateUserException(
            DuplicateUserException ex,
            HttpServletRequest request) {

        Map<String, Object> body = buildBody(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                request.getRequestURI()
        );

        // Include the conflicting email for debugging / client feedback
        if (ex.getEmail() != null) {
            body.put("conflictingEmail", ex.getEmail());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // ── 5. Access Denied ───────────────────────────────────────────────────

    /**
     * Handles our application-level AccessDeniedException.
     * HTTP 403 Forbidden.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(buildBody(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI()));
    }

    /**
     * Handles Spring Security's AccessDeniedException (authentication passed,
     * but the user lacks the required authority/role for the endpoint).
     * HTTP 403 Forbidden.
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleSpringAccessDeniedException(
            org.springframework.security.access.AccessDeniedException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(buildBody(
                        HttpStatus.FORBIDDEN,
                        "Access denied: You do not have permission to perform this action.",
                        request.getRequestURI()
                ));
    }

    // ── 6. JWT Exceptions ──────────────────────────────────────────────────

    /**
     * Handles expired JWT token.
     * HTTP 401 Unauthorized.
     */
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Map<String, Object>> handleExpiredJwtException(
            ExpiredJwtException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(buildBody(
                        HttpStatus.UNAUTHORIZED,
                        "JWT token has expired. Please log in again.",
                        request.getRequestURI()
                ));
    }

    /**
     * Handles JWT with invalid signature.
     * HTTP 401 Unauthorized.
     */
    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<Map<String, Object>> handleSignatureException(
            SignatureException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(buildBody(
                        HttpStatus.UNAUTHORIZED,
                        "JWT signature is invalid. Token may have been tampered with.",
                        request.getRequestURI()
                ));
    }

    /**
     * Handles malformed JWT tokens (bad structure / encoding).
     * HTTP 401 Unauthorized.
     */
    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedJwtException(
            MalformedJwtException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(buildBody(
                        HttpStatus.UNAUTHORIZED,
                        "Malformed JWT token. Please provide a valid token.",
                        request.getRequestURI()
                ));
    }

    /**
     * Handles unsupported JWT format.
     * HTTP 401 Unauthorized.
     */
    @ExceptionHandler(UnsupportedJwtException.class)
    public ResponseEntity<Map<String, Object>> handleUnsupportedJwtException(
            UnsupportedJwtException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(buildBody(
                        HttpStatus.UNAUTHORIZED,
                        "Unsupported JWT token format.",
                        request.getRequestURI()
                ));
    }

    // ── 7. General RuntimeException (catch-all) ────────────────────────────

    /**
     * Last-resort handler for all unhandled RuntimeExceptions.
     * Performs keyword-based smart status mapping so existing service-layer
     * RuntimeExceptions continue to produce sensible HTTP codes without
     * requiring immediate refactoring.
     *
     * Priority (most-specific handlers above this are preferred by Spring):
     *   - "invalid email or password" / "bad credentials" → 401
     *   - "blocked" / "unauthorized" / "revoked"          → 403
     *   - "already registered" / "already exists"         → 409
     *   - "not found"                                     → 404
     *   - everything else                                  → 500
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request) {

        String msg = ex.getMessage();
        HttpStatus status = resolveStatus(msg);

        String clientMessage;
        if (status == HttpStatus.INTERNAL_SERVER_ERROR) {
            log.error("Internal Server Error on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);
            clientMessage = "An internal server error occurred.";
        } else {
            log.warn("Runtime exception resolved to HTTP {} on {} {}: {}", status.value(), request.getMethod(), request.getRequestURI(), msg);
            clientMessage = msg != null ? msg : "An unexpected error occurred.";
        }

        return ResponseEntity
                .status(status)
                .body(buildBody(status, clientMessage, request.getRequestURI()));
    }

    // ── Private Helpers ────────────────────────────────────────────────────

    /**
     * Builds the standard error response body.
     * Fields are ordered: timestamp → status → message → path.
     */
    private Map<String, Object> buildBody(HttpStatus status, String message, String path) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    status.value());
        body.put("message",   message);
        body.put("path",      path);
        return body;
    }

    /**
     * Maps a RuntimeException message to an HTTP status using keyword detection.
     * Used as a compatibility shim until all services throw typed exceptions.
     */
    private HttpStatus resolveStatus(String msg) {
        if (msg == null) return HttpStatus.INTERNAL_SERVER_ERROR;
        String lower = msg.toLowerCase();

        if (lower.contains("invalid email or password") || lower.contains("bad credentials")
                || lower.contains("invalid refresh token") || lower.contains("revoked")) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (lower.contains("blocked") || lower.contains("unauthorized")
                || lower.contains("access denied") || lower.contains("forbidden")) {
            return HttpStatus.FORBIDDEN;
        }
        if (lower.contains("already registered") || lower.contains("already exists")
                || lower.contains("already completed")) {
            return HttpStatus.CONFLICT;
        }
        if (lower.contains("not found")) {
            return HttpStatus.NOT_FOUND;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
