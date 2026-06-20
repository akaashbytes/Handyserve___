package com.handyserve.controller;

import com.handyserve.dto.PromoCodeDto;
import com.handyserve.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/promo/{code}")
    public ResponseEntity<PromoCodeDto> validatePromo(@PathVariable String code) {
        try {
            PromoCodeDto promo = paymentService.validatePromo(code);
            return ResponseEntity.ok(promo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/promo")
    public ResponseEntity<List<PromoCodeDto>> getAllPromoCodes(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(paymentService.getAllPromoCodes(userDetails.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping("/promo")
    public ResponseEntity<PromoCodeDto> createPromoCode(
            @RequestBody PromoCodeDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(paymentService.createPromoCode(dto, userDetails.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PatchMapping("/promo/{id}/active")
    public ResponseEntity<PromoCodeDto> togglePromoCodeActive(
            @PathVariable Long id,
            @RequestParam Boolean active,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(paymentService.togglePromoCodeActive(id, active, userDetails.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/promo/{id}")
    public ResponseEntity<Void> deletePromoCode(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        try {
            paymentService.deletePromoCode(id, userDetails.getUsername());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiatePayment(
            @RequestParam(required = false) Long bookingId,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        Long finalBookingId = bookingId;
        if (finalBookingId == null && body != null && body.containsKey("bookingId")) {
            finalBookingId = Long.valueOf(body.get("bookingId").toString());
        }

        if (finalBookingId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Map<String, Object> details = paymentService.initiatePayment(finalBookingId, userDetails.getUsername());
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) String paymentId,
            @RequestParam(required = false) String signature,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        Long finalBookingId = bookingId;
        String finalPaymentId = paymentId;
        String finalSignature = signature;

        if (body != null) {
            if (finalBookingId == null && body.containsKey("bookingId")) {
                finalBookingId = Long.valueOf(body.get("bookingId").toString());
            }
            if (finalPaymentId == null && body.containsKey("paymentId")) {
                finalPaymentId = body.get("paymentId").toString();
            }
            if (finalSignature == null && body.containsKey("signature")) {
                finalSignature = body.get("signature").toString();
            }
        }

        if (finalBookingId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            if (finalPaymentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "paymentId is required"));
            }
            if (finalSignature == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "signature is required"));
            }
            Map<String, Object> result = paymentService.verifyPayment(
                    finalBookingId,
                    finalPaymentId,
                    finalSignature,
                    userDetails.getUsername()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
