package com.handyserve.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveRequestDto {
    private Long id;
    private Long providerId;
    private String providerName;
    private String skill;
    private String date;
    private List<String> timeSlots;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
}
