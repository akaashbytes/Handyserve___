package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "HS_PROMO_CODES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "promo_seq")
    @SequenceGenerator(name = "promo_seq", sequenceName = "HS_PROMO_SEQ", allocationSize = 1)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String code;

    @Column(length = 200)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PromoType type;

    @Column(nullable = false)
    private Double value;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "EXPIRES_AT")
    private LocalDateTime expiresAt;

    public enum PromoType { percent, flat }
}
