package com.handyserve.service;

import com.handyserve.dto.PromoCodeDto;
import com.handyserve.entity.Booking;
import com.handyserve.entity.PromoCode;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.PromoCodeRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.client.AuthFeignClient;
import com.handyserve.sockets.WebSocketHandler;
import com.handyserve.mapper.PromoCodeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PromoCodeRepository promoCodeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final AuthFeignClient authFeignClient;
    private final NotificationService notificationService;
    private final WebSocketHandler webSocketHandler;

    public PaymentService(PromoCodeRepository promoCodeRepository,
                          BookingRepository bookingRepository,
                          UserRepository userRepository,
                          AuthFeignClient authFeignClient,
                          NotificationService notificationService,
                          WebSocketHandler webSocketHandler) {
        this.promoCodeRepository = promoCodeRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.authFeignClient = authFeignClient;
        this.notificationService = notificationService;
        this.webSocketHandler = webSocketHandler;
    }

    @Transactional(readOnly = true)
    public PromoCodeDto validatePromo(String code) {
        PromoCode promo = promoCodeRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive promo code"));

        if (promo.getExpiresAt() != null && promo.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Promo code has expired");
        }

        return PromoCodeMapper.fromEntity(promo);
    }

    private void checkAdmin(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != User.Role.admin) {
            throw new RuntimeException("Unauthorized: Admin role required");
        }
    }

    @Transactional(readOnly = true)
    public List<PromoCodeDto> getAllPromoCodes(String email) {
        checkAdmin(email);
        return promoCodeRepository.findAll().stream()
                .map(PromoCodeMapper::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PromoCodeDto createPromoCode(PromoCodeDto dto, String email) {
        checkAdmin(email);
        if (promoCodeRepository.findByCodeIgnoreCase(dto.getCode()).isPresent()) {
            throw new RuntimeException("Promo code already exists");
        }
        PromoCode promo = PromoCode.builder()
                .code(dto.getCode().toUpperCase())
                .label(dto.getLabel())
                .type(PromoCode.PromoType.valueOf(dto.getType().toLowerCase()))
                .value(dto.getValue())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .expiresAt(dto.getExpiresAt())
                .build();
        promo = promoCodeRepository.save(promo);
        return PromoCodeMapper.fromEntity(promo);
    }

    @Transactional
    public PromoCodeDto togglePromoCodeActive(Long id, Boolean active, String email) {
        checkAdmin(email);
        PromoCode promo = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        promo.setActive(active);
        promo = promoCodeRepository.save(promo);
        return PromoCodeMapper.fromEntity(promo);
    }

    @Transactional
    public void deletePromoCode(Long id, String email) {
        checkAdmin(email);
        if (!promoCodeRepository.existsById(id)) {
            throw new RuntimeException("Promo code not found");
        }
        promoCodeRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> initiatePayment(Long bookingId, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (user.getRole() != User.Role.admin && !booking.getCustomer().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this booking payment");
        }

        if (booking.getStatus() == Booking.BookingStatus.Completed) {
            throw new RuntimeException("Booking is already completed and paid");
        }

        if (booking.getInvoiceId() == null) {
            booking.setInvoiceId("INV" + System.currentTimeMillis());
            booking = bookingRepository.save(booking);
        }

        String orderId = "order_" + UUID.randomUUID().toString().substring(0, 8);

        Map<String, Object> res = new HashMap<>();
        res.put("orderId", orderId);
        res.put("amount", booking.getAmount());
        res.put("currency", "INR");
        res.put("invoiceId", booking.getInvoiceId());
        res.put("bookingId", booking.getId());

        return res;
    }

    @Transactional
    public Map<String, Object> verifyPayment(Long bookingId, String paymentId, String signature, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (user.getRole() != User.Role.admin && !booking.getCustomer().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this booking payment verification");
        }

        if (booking.getStatus() == Booking.BookingStatus.Pending_Payment) {
            booking.setStatus(Booking.BookingStatus.Completed);
            booking = bookingRepository.save(booking);

            webSocketHandler.broadcastToAll("{\"type\":\"booking:status\",\"id\":" + booking.getId() + ",\"status\":\"Completed\"}");

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    "Payment Successful",
                    "Payment of ₹" + booking.getAmount() + " received for job: " + booking.getService(),
                    "💳"
            );

            notificationService.createNotification(
                    booking.getProvider().getId(),
                    "Job Completed & Settled",
                    "Customer settled booking #" + booking.getId() + ". ₹" + booking.getAmount() + " credited.",
                    "💰"
            );
        } else if (booking.getStatus() != Booking.BookingStatus.Completed) {
            booking.setStatus(Booking.BookingStatus.Completed);
            booking = bookingRepository.save(booking);
            webSocketHandler.broadcastToAll("{\"type\":\"booking:status\",\"id\":" + booking.getId() + ",\"status\":\"Completed\"}");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.Completed) {
            try {
                authFeignClient.updateUserStats(booking.getProvider().getId());
                authFeignClient.updateUserStats(booking.getCustomer().getId());
            } catch (Exception e) {
                // Ignore fallback to prevent breaking transaction if auth service is temporarily unavailable
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("verified", true);
        res.put("bookingId", booking.getId());
        res.put("status", "Completed");

        return res;
    }
}
