package com.handyserve.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handyserve.dto.AuthResponse;
import com.handyserve.dto.LoginRequest;
import com.handyserve.dto.RegisterRequest;
import com.handyserve.dto.UserDto;
import com.handyserve.entity.Booking;
import com.handyserve.entity.PendingRegistration;
import com.handyserve.entity.User;
import com.handyserve.entity.VerificationToken;
import com.handyserve.mapper.UserMapper;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.PendingRegistrationRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.repository.oracle.VerificationTokenRepository;
import com.handyserve.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    public UserService(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            VerificationTokenRepository verificationTokenRepository,
            PendingRegistrationRepository pendingRegistrationRepository,
            EmailService emailService,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
    }

    // ── Registration (Verify-First) ──────────────────────────────────────────

    /**
     * Step 1 of registration.
     *
     * Stores the full registration payload in HS_PENDING_REGS (NOT in HS_USERS),
     * generates a 6-digit OTP, and emails it to the user.
     *
     * The real User row is only created in {@link #verifyOtp(String, String)}
     * after the OTP is confirmed.
     *
     * @return Map with email and a human-readable message — no User object.
     */
    @Transactional
    public java.util.Map<String, String> register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        // Reject if email is already a verified user in HS_USERS
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("Email already registered");
        }

        // If a pending registration exists for this email, delete it so the
        // user can re-submit (e.g. they want to change their data or retry).
        pendingRegistrationRepository.findByEmailIgnoreCase(email).ifPresent(existing -> {
            verificationTokenRepository.findByPendingId(existing.getId())
                    .ifPresent(token -> {
                        verificationTokenRepository.delete(token);
                        verificationTokenRepository.flush();
                    });
            pendingRegistrationRepository.delete(existing);
            pendingRegistrationRepository.flush();
        });

        // Serialize the full RegisterRequest to JSON for storage
        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(req);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize registration data: " + e.getMessage());
        }

        // Save pending registration (NO User row created yet)
        PendingRegistration pending = PendingRegistration.builder()
                .email(email)
                .payloadJson(payloadJson)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        pending = pendingRegistrationRepository.save(pending);

        // Generate 6-digit OTP and save it linked to the pending row
        String otp = generateOtp();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(otp)
                .pendingId(pending.getId())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        verificationTokenRepository.save(verificationToken);

        // Send OTP email (fire-and-forget — failure does not block registration)
        emailService.sendOtpEmail(email, req.getName(), otp);

        java.util.Map<String, String> result = new java.util.LinkedHashMap<>();
        result.put("email", email);
        result.put("message", "OTP sent to " + email + ". Please verify your email to complete registration.");
        return result;
    }

    // ── OTP Verification (Creates real User) ────────────────────────────────

    /**
     * Step 2 of registration.
     *
     * Validates the OTP against the pending registration. On success:
     *   1. Deserializes the stored JSON back to RegisterRequest
     *   2. Creates and saves the real User in HS_USERS (with verified=true)
     *   3. Deletes the pending registration row and OTP token
     */
    @Transactional
    public void verifyOtp(String email, String otp) {
        email = email.trim().toLowerCase();

        // Look up the pending registration for this email
        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new com.handyserve.exception.ValidationException(
                        "email",
                        "No pending registration found for this email. Please register first."));

        // Check if pending registration itself has expired (10 min window)
        if (pending.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.findByPendingId(pending.getId())
                    .ifPresent(verificationTokenRepository::delete);
            pendingRegistrationRepository.delete(pending);
            throw new com.handyserve.exception.ValidationException(
                    "otp",
                    "Your registration session has expired. Please register again.");
        }

        // Look up the OTP token for this pending registration
        VerificationToken token = verificationTokenRepository.findByPendingId(pending.getId())
                .orElseThrow(() -> new com.handyserve.exception.ValidationException(
                        "otp",
                        "No OTP code found. Please request a new one."));

        // Check if the OTP itself has expired (5 min window)
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(token);
            throw new com.handyserve.exception.ValidationException(
                    "otp",
                    "OTP code has expired. Please click Resend OTP.");
        }

        // Validate OTP value
        if (!token.getToken().equals(otp)) {
            throw new com.handyserve.exception.ValidationException("otp", "Invalid OTP code. Please try again.");
        }

        // ── OTP is valid — now create the real User ──────────────────────────
        RegisterRequest req;
        try {
            req = objectMapper.readValue(pending.getPayloadJson(), RegisterRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore registration data. Please register again.");
        }

        // Double-check: another request might have registered the same email in the window
        if (userRepository.existsByEmailIgnoreCase(email)) {
            verificationTokenRepository.delete(token);
            pendingRegistrationRepository.delete(pending);
            throw new RuntimeException("Email already registered. Please log in.");
        }

        String avatar = req.getAvatar();
        if (avatar == null || avatar.trim().isEmpty()) {
            avatar = extractInitials(req.getName());
        }

        User user = User.builder()
                .name(req.getName())
                .email(email)
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.valueOf(req.getRole().toLowerCase()))
                .avatar(avatar)
                .profilePhoto(req.getProfilePhoto())
                .verified(true)            // ← Email is verified by definition
                .blocked(false)
                .state(req.getState() != null ? req.getState() : "Tamil Nadu")
                .city(req.getCity())
                .serviceCity(req.getServiceCity())
                .serviceCityActive(req.getServiceCityActive() != null ? req.getServiceCityActive() : true)
                .location(req.getLocation())
                .displayAddress(req.getDisplayAddress())
                .address(req.getAddress())
                .pincode(req.getPincode())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .detectedCityLabel(req.getDetectedCityLabel())
                .serviceType(req.getServiceType())
                .experience(req.getExperience())
                .timing(req.getTiming())
                .radius(req.getRadius())
                .pricing(req.getPricing())
                .reliabilityScore(0)
                .averageRating(0.0)
                .reviews(0)
                .lowScoreDays(0)
                .available(true)
                .idType(req.getIdType())
                .idNumber(req.getIdNumber())
                .aadhaarNumber(req.getAadhaarNumber())
                .aadhaarDoc(req.getAadhaarDoc())
                .drivingLicenseNumber(req.getDrivingLicenseNumber())
                .drivingLicenseDoc(req.getDrivingLicenseDoc())
                .bankAccountNumber(req.getBankAccountNumber())
                .bankIfscCode(req.getBankIfscCode())
                .bankPassbookDoc(req.getBankPassbookDoc())
                .upi(req.getUpi())
                .bankName(req.getBankName())
                .accountHolder(req.getAccountHolder())
                .gender(req.getGender())
                .age(req.getAge())
                .build();

        userRepository.save(user);

        // Cleanup: remove OTP token and pending row
        verificationTokenRepository.delete(token);
        pendingRegistrationRepository.delete(pending);
    }

    // ── Resend OTP ───────────────────────────────────────────────────────────

    /**
     * Resends the OTP for a pending (not yet verified) registration.
     * Operates on HS_PENDING_REGS — NOT on HS_USERS.
     */
    @Transactional
    public void resendOtp(String email) {
        email = email.trim().toLowerCase();

        // First check if the email is already a verified user
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new com.handyserve.exception.ValidationException(
                    "email",
                    "Email is already verified. Please log in.");
        }

        // Must have a pending registration to resend OTP
        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new com.handyserve.exception.ValidationException(
                        "email",
                        "No pending registration found for this email. Please register first."));

        // Extend expiry on the pending record (fresh 10-min window)
        pending.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        pendingRegistrationRepository.save(pending);

        // Delete any existing OTP token for this pending registration
        verificationTokenRepository.findByPendingId(pending.getId())
                .ifPresent(token -> {
                    verificationTokenRepository.delete(token);
                    verificationTokenRepository.flush();
                });

        // Generate a fresh OTP
        String otp = generateOtp();
        VerificationToken newToken = VerificationToken.builder()
                .token(otp)
                .pendingId(pending.getId())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        verificationTokenRepository.save(newToken);

        // Deserialize the original request to get the user's name for the email
        String name = email; // fallback
        try {
            RegisterRequest req = objectMapper.readValue(pending.getPayloadJson(), RegisterRequest.class);
            if (req.getName() != null) name = req.getName();
        } catch (Exception ignored) { }

        emailService.sendOtpEmail(email, name, otp);
    }

    // ── Login ────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // This should never trigger now (user is only created after OTP verification),
        // but kept as a safety guard.
        if (!user.getVerified()) {
            throw new com.handyserve.exception.ValidationException(
                    "email",
                    "Email address not verified. Please verify your email first.");
        }

        if (user.getBlocked()) {
            throw new RuntimeException("Your account has been blocked by the admin.");
        }

        String token = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setRefreshToken(jwtService.hashToken(refreshToken));
        userRepository.save(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(UserMapper.fromEntity(user))
                .build();
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    @Transactional
    public void logout(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    // ── Profile ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserMapper.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public String getRefreshToken(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(User::getRefreshToken)
                .orElse(null);
    }

    @Transactional
    public UserDto selectRole(String email, String roleStr) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new com.handyserve.exception.ResourceNotFoundException("User not found with email: " + email));

        if (roleStr == null || roleStr.trim().isEmpty()) {
            throw new com.handyserve.exception.ValidationException("role", "Role cannot be empty");
        }

        String normalizedRole = roleStr.trim().toUpperCase();

        if ("ADMIN".equals(normalizedRole)) {
            throw new com.handyserve.exception.AccessDeniedException("Privilege escalation detected: Cannot assign ADMIN role.");
        }

        if (!"CUSTOMER".equals(normalizedRole) && !"PROVIDER".equals(normalizedRole)) {
            throw new com.handyserve.exception.ValidationException("role", "Invalid role selected. Must be CUSTOMER or PROVIDER.");
        }

        if (user.getRole() != null) {
            throw new com.handyserve.exception.ValidationException("role", "Role is already selected and cannot be changed.");
        }

        User.Role role = User.Role.valueOf(normalizedRole.toLowerCase());
        user.setRole(role);
        user = userRepository.save(user);

        return UserMapper.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UserDto updatedData) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedData.getName() != null) user.setName(updatedData.getName());
        if (updatedData.getPhone() != null) user.setPhone(updatedData.getPhone());
        if (updatedData.getAvatar() != null) user.setAvatar(updatedData.getAvatar());
        if (updatedData.getProfilePhoto() != null) user.setProfilePhoto(updatedData.getProfilePhoto());
        if (updatedData.getState() != null) user.setState(updatedData.getState());
        if (updatedData.getCity() != null) user.setCity(updatedData.getCity());
        if (updatedData.getServiceCity() != null) user.setServiceCity(updatedData.getServiceCity());
        if (updatedData.getServiceCityActive() != null) user.setServiceCityActive(updatedData.getServiceCityActive());
        if (updatedData.getLocation() != null) user.setLocation(updatedData.getLocation());
        if (updatedData.getDisplayAddress() != null) user.setDisplayAddress(updatedData.getDisplayAddress());
        if (updatedData.getAddress() != null) user.setAddress(updatedData.getAddress());
        if (updatedData.getPincode() != null) user.setPincode(updatedData.getPincode());
        if (updatedData.getLatitude() != null) user.setLatitude(updatedData.getLatitude());
        if (updatedData.getLongitude() != null) user.setLongitude(updatedData.getLongitude());
        if (updatedData.getDetectedCityLabel() != null) user.setDetectedCityLabel(updatedData.getDetectedCityLabel());

        // Provider fields
        if (updatedData.getServiceType() != null) user.setServiceType(updatedData.getServiceType());
        if (updatedData.getExperience() != null) user.setExperience(updatedData.getExperience());
        if (updatedData.getTiming() != null) user.setTiming(updatedData.getTiming());
        if (updatedData.getRadius() != null) user.setRadius(updatedData.getRadius());
        if (updatedData.getPricing() != null) user.setPricing(updatedData.getPricing());
        if (updatedData.getAvailable() != null) user.setAvailable(updatedData.getAvailable());

        // Verification fields
        if (updatedData.getIdType() != null) user.setIdType(updatedData.getIdType());
        if (updatedData.getIdNumber() != null) user.setIdNumber(updatedData.getIdNumber());
        if (updatedData.getAadhaarNumber() != null) user.setAadhaarNumber(updatedData.getAadhaarNumber());
        if (updatedData.getAadhaarDoc() != null) user.setAadhaarDoc(updatedData.getAadhaarDoc());
        if (updatedData.getDrivingLicenseNumber() != null) user.setDrivingLicenseNumber(updatedData.getDrivingLicenseNumber());
        if (updatedData.getDrivingLicenseDoc() != null) user.setDrivingLicenseDoc(updatedData.getDrivingLicenseDoc());
        if (updatedData.getBankAccountNumber() != null) user.setBankAccountNumber(updatedData.getBankAccountNumber());
        if (updatedData.getBankIfscCode() != null) user.setBankIfscCode(updatedData.getBankIfscCode());
        if (updatedData.getBankPassbookDoc() != null) user.setBankPassbookDoc(updatedData.getBankPassbookDoc());
        if (updatedData.getUpi() != null) user.setUpi(updatedData.getUpi());
        if (updatedData.getBankName() != null) user.setBankName(updatedData.getBankName());
        if (updatedData.getAccountHolder() != null) user.setAccountHolder(updatedData.getAccountHolder());
        if (updatedData.getGender() != null) user.setGender(updatedData.getGender());
        if (updatedData.getAge() != null) user.setAge(updatedData.getAge());
        if (updatedData.getEmergencyContactName() != null) user.setEmergencyContactName(updatedData.getEmergencyContactName());
        if (updatedData.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(updatedData.getEmergencyContactPhone());
        if (updatedData.getEmergencyContactRelationship() != null) user.setEmergencyContactRelationship(updatedData.getEmergencyContactRelationship());

        user = userRepository.save(user);
        return UserMapper.fromEntity(user);
    }

    // ── Token Refresh ─────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBlocked()) {
            throw new RuntimeException("User is blocked");
        }

        String incomingHash = jwtService.hashToken(refreshToken);
        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(incomingHash)) {
            user.setRefreshToken(null);
            userRepository.save(user);
            throw new RuntimeException("Revoked or invalid refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setRefreshToken(jwtService.hashToken(newRefreshToken));
        userRepository.save(user);

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(UserMapper.fromEntity(user))
                .build();
    }

    // ── Password Reset (uses HS_USERS — works for already-verified users) ─────

    /**
     * Initiates password reset by generating OTP and emailing user.
     * Uses a separate token with pendingId = 0 as a sentinel for "password reset".
     * Since the user already exists in HS_USERS, we store the token keyed by
     * a well-known sentinel pendingId (-userId) to distinguish from registration OTPs.
     */
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new com.handyserve.exception.ResourceNotFoundException(
                        "User not found with email: " + email));

        // Use negative userId as a sentinel "pendingId" for password reset tokens
        long sentinelPendingId = -user.getId();

        // Delete any existing password reset token for this user
        verificationTokenRepository.findByPendingId(sentinelPendingId)
                .ifPresent(token -> {
                    verificationTokenRepository.delete(token);
                    verificationTokenRepository.flush();
                });

        String otp = generateOtp();
        VerificationToken token = VerificationToken.builder()
                .token(otp)
                .pendingId(sentinelPendingId)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        verificationTokenRepository.save(token);

        emailService.sendPasswordResetOtpEmail(user.getEmail(), user.getName(), otp);
    }

    /**
     * Completes password reset after OTP verification.
     */
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new com.handyserve.exception.ResourceNotFoundException(
                        "User not found with email: " + email));

        long sentinelPendingId = -user.getId();

        VerificationToken token = verificationTokenRepository.findByPendingId(sentinelPendingId)
                .orElseThrow(() -> new com.handyserve.exception.ValidationException(
                        "otp",
                        "No OTP code generated for this email. Please request a new one."));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(token);
            throw new com.handyserve.exception.ValidationException(
                    "otp",
                    "OTP code has expired. Please request a new one.");
        }

        if (!token.getToken().equals(otp)) {
            throw new com.handyserve.exception.ValidationException("otp", "Invalid OTP code. Please try again.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        verificationTokenRepository.delete(token);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @Transactional
    public void updateUserStats(User user) {
        if (user == null) return;

        if (user.getRole() == User.Role.provider) {
            Double avgRating = bookingRepository.avgRatingByProvider(user).orElse(0.0);
            long completedCount = bookingRepository.countByProviderAndStatus(user, Booking.BookingStatus.Completed);
            long cancelledCount = bookingRepository.countByProviderAndStatus(user, Booking.BookingStatus.Cancelled);
            long totalCount = completedCount + cancelledCount;

            int reliability = 0;
            if (totalCount > 0) {
                double completionRate = ((double) completedCount / totalCount) * 100.0;
                if (bookingRepository.avgRatingByProvider(user).isPresent()) {
                    reliability = (int) Math.round(completionRate * 0.5 + (avgRating * 20.0) * 0.5);
                } else {
                    reliability = (int) Math.round(completionRate);
                }
            }
            long reviewsCount = bookingRepository.countByProviderAndStatusAndRatingIsNotNull(user, Booking.BookingStatus.Completed);

            user.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
            user.setReliabilityScore(reliability);
            user.setReviews((int) reviewsCount);
            userRepository.save(user);

        } else if (user.getRole() == User.Role.customer) {
            List<Booking> customerBookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(user);
            List<Booking> completedRated = customerBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed && b.getRating() != null)
                .collect(Collectors.toList());

            double avgRating = completedRated.stream()
                .mapToDouble(Booking::getRating)
                .average()
                .orElse(0.0);

            long completedCount = customerBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed)
                .count();
            long cancelledCount = customerBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Cancelled)
                .count();
            long totalCount = completedCount + cancelledCount;

            int reliability = 0;
            if (totalCount > 0) {
                reliability = (int) Math.round(((double) completedCount / totalCount) * 100.0);
            }

            user.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
            user.setReliabilityScore(reliability);
            userRepository.save(user);
        }
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private String extractInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "U";
        String[] parts = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) sb.append(p.charAt(0));
        }
        String initials = sb.toString().toUpperCase();
        return initials.isEmpty() ? "U" : initials.substring(0, Math.min(initials.length(), 2));
    }

    private String generateOtp() {
        return String.format("%06d", new java.util.Random().nextInt(1000000));
    }
}
