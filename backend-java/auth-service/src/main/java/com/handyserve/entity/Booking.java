package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "HS_BOOKINGS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "booking_seq")
    @SequenceGenerator(name = "booking_seq", sequenceName = "HS_BOOKING_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 100)
    private String service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private BookingStatus status = BookingStatus.Requested;

    @Column(name = "BOOKING_DATE", nullable = false, length = 20)
    private String date;

    @Column(name = "BOOKING_TIME", length = 20)
    private String time;

    @Builder.Default
    private Double amount = 0.0;

    @Column(length = 500)
    private String options;

    private Integer rating;

    @Column(name = "INVOICE_ID", length = 50)
    private String invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CUSTOMER_ID", nullable = false)
    private User customer;

    @Column(name = "CUSTOMER_NAME", length = 100)
    private String customerName;

    @Column(name = "CUSTOMER_CITY", length = 100)
    private String customerCity;

    @Column(name = "CUSTOMER_LAT")
    private Double customerLatitude;

    @Column(name = "CUSTOMER_LON")
    private Double customerLongitude;

    @Column(name = "CUSTOMER_ADDRESS", length = 500)
    private String customerAddress;

    @Column(name = "CUSTOMER_DIRECTIONS_URL", length = 500)
    private String customerDirectionsUrl;

    @Column(name = "NAV_TO_CUSTOMER_URL", length = 500)
    private String navigationToCustomerUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROVIDER_ID", nullable = false)
    private User provider;

    @Column(name = "PROVIDER_NAME", length = 100)
    private String providerName;

    @Column(name = "PROVIDER_CITY", length = 100)
    private String providerCity;

    @Column(name = "PROVIDER_LAT")
    private Double providerLatitude;

    @Column(name = "PROVIDER_LON")
    private Double providerLongitude;

    @Column(name = "PAYMENT_METHOD", length = 50)
    private String paymentMethod;

    @Column(name = "PAYMENT_ID", length = 100)
    private String paymentId;

    @Column(name = "PAID_AT")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        Requested, Accepted, On_the_Way, Destination, Reached, Reached_Confirmed, Pending_Payment, Completed, Cancelled, Rejected;
    }
}
