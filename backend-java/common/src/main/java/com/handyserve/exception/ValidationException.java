package com.handyserve.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when business-level validation logic fails (distinct from Bean Validation
 * which is handled via @Valid / MethodArgumentNotValidException).
 * Maps to HTTP 400 Bad Request.
 *
 * Usage:
 *   throw new ValidationException("Booking cannot be cancelled after it has started");
 *   throw new ValidationException("Status transition from COMPLETED to ACCEPTED is not allowed");
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ValidationException extends RuntimeException {

    private final String field;

    /** Constructor with just a message */
    public ValidationException(String message) {
        super(message);
        this.field = null;
    }

    /** Constructor that names the specific field that failed validation */
    public ValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() { return field; }
}
