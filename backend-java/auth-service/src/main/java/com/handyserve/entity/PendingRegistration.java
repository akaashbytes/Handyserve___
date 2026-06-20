package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Temporary holding area for registration data BEFORE email OTP verification.
 *
 * Lifecycle:
 *   1. User submits registration form  → row inserted here, OTP sent
 *   2. User verifies OTP               → real User row created, this row deleted
 *   3. OTP expires (10 min, no verify) → row stays until resend or cleaned up
 *
 * No corresponding row in HS_USERS is created until step 2 succeeds.
 */
@Entity
@Table(name = "HS_PENDING_REGS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PendingRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pending_reg_seq")
    @SequenceGenerator(name = "pending_reg_seq", sequenceName = "HS_PENDING_REG_SEQ", allocationSize = 1)
    private Long id;

    /**
     * The email the user wants to register with.
     * Unique — prevents duplicate pending rows for the same email.
     */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * Full RegisterRequest serialized as JSON.
     * Stored as CLOB to handle large base64 document uploads (Aadhaar, DL, bank passbook).
     */
    @Lob
    @Basic(fetch = FetchType.EAGER)
    @Column(name = "PAYLOAD_JSON", nullable = false)
    private String payloadJson;

    /**
     * When this pending registration expires (10 minutes from creation).
     * After expiry the OTP is also invalidated.
     */
    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}
