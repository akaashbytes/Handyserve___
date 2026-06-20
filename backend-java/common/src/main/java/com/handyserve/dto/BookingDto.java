package com.handyserve.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingDto {
    private Long id;
    private String service;
    private String status;
    private String date;
    private String time;
    private Double amount;
    private String options;
    private Integer rating;
    private String invoiceId;

    // Customer info
    private Long customerId;
    private String customerName;
    private String customerCity;
    private Double customerLatitude;
    private Double customerLongitude;
    private String customerAddress;
    private String customerDirectionsUrl;
    private String navigationToCustomerUrl;

    // Provider info
    private Long serviceProviderId; // frontend uses serviceProviderId
    private String providerName;
    private String providerCity;
    private Double providerLatitude;
    private Double providerLongitude;
    private String providerPhoto;

    // Payment info
    private String paymentMethod;
    private String paymentId;
    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
