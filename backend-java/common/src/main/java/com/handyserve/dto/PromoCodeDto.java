package com.handyserve.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PromoCodeDto {
    private Long id;
    private String code;
    private String label;
    private String type; // percent | flat
    private Double value;
    private Boolean active;
    private LocalDateTime expiresAt;
}
