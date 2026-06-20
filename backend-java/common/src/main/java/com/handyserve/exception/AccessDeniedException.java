package com.handyserve.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an authenticated user tries to access a resource they are not
 * permitted to access (role mismatch, ownership violation, etc.).
 * Maps to HTTP 403 Forbidden.
 *
 * Note: This is our application-level access denied — it is distinct from Spring
 * Security's own AccessDeniedException (which is also handled in the global handler).
 *
 * Usage:
 *   throw new AccessDeniedException("You are not allowed to cancel another user's booking");
 *   throw new AccessDeniedException("Admin role required to perform this action");
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }
}
