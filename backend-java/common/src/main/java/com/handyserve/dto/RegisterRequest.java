package com.handyserve.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {

    // ── Core Required Fields ────────────────────────────────────────────────

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Phone must be exactly 10 digits and start with 6, 7, 8, or 9"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&^#()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])[A-Za-z\\d@$!%*?&^#()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(
        regexp = "^(customer|provider|admin)$",
        message = "Role must be customer, provider, or admin"
    )
    private String role;

    // ── Optional Profile Fields ─────────────────────────────────────────────

    private String avatar;
    private String profilePhoto;

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

    // ── Optional Provider Details ───────────────────────────────────────────

    private String serviceType;
    private String experience;
    private String timing;

    @Min(value = 1, message = "Service radius must be at least 1 km")
    @Max(value = 100, message = "Service radius must not exceed 100 km")
    private Integer radius;

    private String pricing;

    private String gender;

    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 100, message = "Age must be at most 100")
    private Integer age;

    // ── Optional Bank / KYC Verification Fields ─────────────────────────────

    private String idType;
    private String idNumber;

    @Pattern(
        regexp = "^(\\d{12})?$",
        message = "Aadhaar number must be exactly 12 digits"
    )
    private String aadhaarNumber;

    private String aadhaarDoc;

    private String drivingLicenseNumber;
    private String drivingLicenseDoc;

    private String bankAccountNumber;

    @Pattern(
        regexp = "^([A-Z]{4}0[A-Z0-9]{6})?$",
        message = "Invalid IFSC code format (e.g. SBIN0001234)"
    )
    private String bankIfscCode;

    private String bankPassbookDoc;
    private String upi;
    private String bankName;
    private String accountHolder;
}
