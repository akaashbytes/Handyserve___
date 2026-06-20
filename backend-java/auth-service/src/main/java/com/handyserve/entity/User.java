package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "HS_USERS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "HS_USER_SEQ", allocationSize = 1)
    private Long id;

    // ── Core ────────────────────────────────────────────────────────────────
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 10)
    private String avatar;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "PROFILE_PHOTO")
    private String profilePhoto;

    @Builder.Default
    private Boolean verified = false;

    @Builder.Default
    private Boolean blocked = false;

    // ── Location ────────────────────────────────────────────────────────────
    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String city;

    @Column(name = "SERVICE_CITY", length = 100)
    private String serviceCity;

    @Column(name = "SERVICE_CITY_ACTIVE")
    @Builder.Default
    private Boolean serviceCityActive = true;

    @Column(length = 200)
    private String location;

    @Column(name = "DISPLAY_ADDRESS", length = 500)
    private String displayAddress;

    @Column(length = 300)
    private String address;

    @Column(length = 10)
    private String pincode;

    private Double latitude;
    private Double longitude;

    @Column(name = "DETECTED_CITY_LABEL", length = 100)
    private String detectedCityLabel;

    // ── Provider-only ────────────────────────────────────────────────────────
    @Column(name = "SERVICE_TYPE", length = 100)
    private String serviceType;

    @Column(length = 50)
    private String experience;

    @Column(length = 50)
    private String timing;

    private Integer radius;

    @Column(length = 50)
    private String pricing;

    @Column(name = "RELIABILITY_SCORE")
    @Builder.Default
    private Integer reliabilityScore = 0;

    @Column(name = "AVERAGE_RATING")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "REVIEWS_COUNT")
    @Builder.Default
    private Integer reviews = 0;

    @Column(name = "LOW_SCORE_DAYS")
    @Builder.Default
    private Integer lowScoreDays = 0;

    @Builder.Default
    private Boolean available = true;

    // ── Provider verification ────────────────────────────────────────────────
    @Column(name = "ID_TYPE", length = 50)
    private String idType;

    @Column(name = "ID_NUMBER", length = 50)
    private String idNumber;

    @Column(name = "AADHAAR_NUMBER", length = 20)
    private String aadhaarNumber;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "AADHAAR_DOC")
    private String aadhaarDoc;

    @Column(name = "DRIVING_LICENSE_NUMBER", length = 50)
    private String drivingLicenseNumber;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "DRIVING_LICENSE_DOC")
    private String drivingLicenseDoc;

    @Column(name = "BANK_ACCOUNT_NUMBER", length = 30)
    private String bankAccountNumber;

    @Column(name = "BANK_IFSC_CODE", length = 20)
    private String bankIfscCode;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "BANK_PASSBOOK_DOC")
    private String bankPassbookDoc;

    @Column(length = 100)
    private String upi;

    @Column(name = "BANK_NAME", length = 100)
    private String bankName;

    @Column(name = "ACCOUNT_HOLDER", length = 100)
    private String accountHolder;

    @Column(length = 20)
    private String gender;

    private Integer age;

    @Column(name = "EMERGENCY_CONTACT_NAME", length = 100)
    private String emergencyContactName;

    @Column(name = "EMERGENCY_CONTACT_PHONE", length = 20)
    private String emergencyContactPhone;

    @Column(name = "EMERGENCY_CONTACT_RELATIONSHIP", length = 50)
    private String emergencyContactRelationship;

    // ── Refresh token (hashed) ───────────────────────────────────────────────
    @Column(name = "REFRESH_TOKEN", length = 512)
    private String refreshToken;

    // ── Audit ────────────────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    // ── Enums ────────────────────────────────────────────────────────────────
    public enum Role { customer, provider, admin }
}
