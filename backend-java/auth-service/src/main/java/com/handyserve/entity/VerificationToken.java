package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stores the 6-digit OTP associated with a PENDING registration or a password reset.
 *
 * Registration OTPs: pendingId references HS_PENDING_REGS.ID (positive value)
 * Password reset OTPs: pendingId = -userId (negative value, sentinel for password reset)
 *
 * The FK is a plain Long column (not a JPA @ManyToOne/@OneToOne) because
 * the target table differs depending on the token's purpose.
 */
@Entity
@Table(name = "HS_VERIFICATION_TOKENS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "verif_token_seq")
    @SequenceGenerator(name = "verif_token_seq", sequenceName = "HS_VERIF_TOKEN_SEQ", allocationSize = 1)
    private Long id;

    /** The 6-digit OTP code. */
    @Column(nullable = false, unique = true, length = 100)
    private String token;

    /**
     * For registration OTPs: positive ID of the HS_PENDING_REGS row.
     * For password reset OTPs: negative user ID (i.e. -userId) as sentinel.
     *
     * Named USER_ID in the DDL for backward compatibility with the existing
     * Oracle table — Hibernate update mode will not recreate the column.
     */
    @Column(name = "USER_ID", nullable = false)
    private Long pendingId;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;
}
