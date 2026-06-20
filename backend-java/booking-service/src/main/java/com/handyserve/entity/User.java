package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HS_USERS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String avatar;
    
    @Column(name = "PROFILE_PHOTO")
    private String profilePhoto;

    private Boolean verified;
    private Boolean blocked;

    private String state;
    private String city;

    @Column(name = "SERVICE_CITY")
    private String serviceCity;

    @Column(name = "SERVICE_CITY_ACTIVE")
    private Boolean serviceCityActive;

    private String location;

    @Column(name = "DISPLAY_ADDRESS")
    private String displayAddress;

    private String address;
    private String pincode;

    private Double latitude;
    private Double longitude;

    @Column(name = "DETECTED_CITY_LABEL")
    private String detectedCityLabel;

    @Column(name = "SERVICE_TYPE")
    private String serviceType;

    private String experience;
    private String timing;
    private Integer radius;
    private String pricing;

    @Column(name = "RELIABILITY_SCORE")
    private Integer reliabilityScore;

    @Column(name = "AVERAGE_RATING")
    private Double averageRating;

    @Column(name = "REVIEWS_COUNT")
    private Integer reviews;

    @Column(name = "LOW_SCORE_DAYS")
    private Integer lowScoreDays;

    private Boolean available;

    @Column(name = "ID_TYPE")
    private String idType;

    @Column(name = "ID_NUMBER")
    private String idNumber;

    @Column(name = "AADHAAR_NUMBER")
    private String CheckAadhaarNumber;

    @Lob
    @Column(name = "AADHAAR_DOC")
    private String aadhaarDoc;

    @Column(name = "DRIVING_LICENSE_NUMBER")
    private String drivingLicenseNumber;

    @Lob
    @Column(name = "DRIVING_LICENSE_DOC")
    private String drivingLicenseDoc;

    @Column(name = "BANK_ACCOUNT_NUMBER")
    private String bankAccountNumber;

    @Column(name = "BANK_IFSC_CODE")
    private String bankIfscCode;

    @Lob
    @Column(name = "BANK_PASSBOOK_DOC")
    private String bankPassbookDoc;

    private String upi;

    @Column(name = "BANK_NAME")
    private String bankName;

    @Column(name = "ACCOUNT_HOLDER")
    private String accountHolder;

    private String gender;
    private Integer age;

    @Column(name = "EMERGENCY_CONTACT_NAME")
    private String emergencyContactName;

    @Column(name = "EMERGENCY_CONTACT_PHONE")
    private String emergencyContactPhone;

    @Column(name = "EMERGENCY_CONTACT_RELATIONSHIP")
    private String emergencyContactRelationship;

    @Column(name = "REFRESH_TOKEN")
    private String refreshToken;

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public enum Role { customer, provider, admin }
}
