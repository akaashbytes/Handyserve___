package com.handyserve.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DisputeDto {
    private String id;
    private Long bookingId;
    private Long customerId;
    private String customer;
    private String customerEmail;
    private Long serviceProviderId;
    private String provider;
    private String providerEmail;
    private String issue;
    private String issueCategory;
    private String priority;
    private String source;
    private Double amount;
    private String status;
    private String date;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<UpdateEntryDto> updates = new ArrayList<>();

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateEntryDto {
        private String id;
        private String actor;
        private String actorRole;
        private String note;
        private String at;
    }
}
