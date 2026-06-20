package com.handyserve.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String avatar;
    private String profilePhoto;
    private Boolean verified;
    private Boolean blocked;

    private String state;
    private String city;
    private String serviceCity;
    private Boolean serviceCityActive;
    private String location;
    private String displayAddress;
    private String address;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String detectedCityLabel;

    // Provider fields
    private String serviceType;
    private String experience;
    private String timing;
    private Integer radius;
    private String pricing;
    private Integer reliabilityScore;
    private Double averageRating;
    private Integer reviews;
    private Integer lowScoreDays;
    private Boolean available;

    // Provider bank/identity details
    private String idType;
    private String idNumber;
    private String aadhaarNumber;
    private String aadhaarDoc;
    private String drivingLicenseNumber;
    private String drivingLicenseDoc;
    private String bankAccountNumber;
    private String bankIfscCode;
    private String bankPassbookDoc;
    private String upi;
    private String bankName;
    private String accountHolder;
    private String gender;
    private Integer age;

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
