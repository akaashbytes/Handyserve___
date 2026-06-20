package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private BookingStatus status;

    @Column(name = "BOOKING_DATE", nullable = false, length = 20)
    private String date;

    @Builder.Default
    private Double amount = 0.0;

    @Column(name = "INVOICE_ID", length = 50)
    private String invoiceId;

    @Column(name = "BOOKING_TIME", length = 20)
    private String time;

    @Column(name = "PROVIDER_NAME", length = 100)
    private String providerName;

    @Column(name = "PAYMENT_METHOD", length = 50)
    private String paymentMethod;

    @Column(name = "PAYMENT_ID", length = 100)
    private String paymentId;

    @Column(name = "PAID_AT")
    private java.time.LocalDateTime paidAt;

    @Column(name = "CREATED_AT", updatable = false)
    private java.time.LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CUSTOMER_ID", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROVIDER_ID", nullable = false)
    private User provider;

    public enum BookingStatus {
        Requested, Accepted, On_the_Way, Destination, Reached, Reached_Confirmed, Pending_Payment, Completed, Cancelled, Rejected;
    }
}
