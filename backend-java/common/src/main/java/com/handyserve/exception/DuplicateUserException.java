package com.handyserve.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a registration attempt is made with an email that already exists.
 * Maps to HTTP 409 Conflict.
 *
 * Usage:
 *   throw new DuplicateUserException("Email already registered: john@example.com");
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateUserException extends RuntimeException {

    private final String email;

    /** Constructor with just a message */
    public DuplicateUserException(String message) {
        super(message);
        this.email = null;
    }

    /** Constructor that includes the conflicting email for context */
    public DuplicateUserException(String message, String email) {
        super(message);
        this.email = email;
    }

    public String getEmail() { return email; }
}
