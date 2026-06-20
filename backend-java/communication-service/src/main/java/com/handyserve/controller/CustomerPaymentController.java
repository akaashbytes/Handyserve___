package com.handyserve.controller;

import com.handyserve.entity.Booking;
import com.handyserve.entity.Payment;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.PaymentRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer/payments")
public class CustomerPaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public CustomerPaymentController(PaymentService paymentService,
                                     PaymentRepository paymentRepository,
                                     BookingRepository bookingRepository,
                                     UserRepository userRepository) {
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    private User getCustomer(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (user.getRole() != User.Role.customer) {
            throw new RuntimeException("Unauthorized: Customer role required");
        }
        return user;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getPaymentSummary(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User customer = getCustomer(userDetails.getUsername());

        List<Booking> bookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(customer);

        double totalPaid = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed)
                .mapToDouble(Booking::getAmount)
                .sum();

        double totalDue = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Pending_Payment)
                .mapToDouble(Booking::getAmount)
                .sum();

        long pendingCount = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Pending_Payment)
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaid", totalPaid);
        summary.put("totalDue", totalDue);
        summary.put("pendingCount", pendingCount);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<Map<String, Object>>> getInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User customer = getCustomer(userDetails.getUsername());

        List<Booking> bookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(customer);

        // Map bookings to invoice structures
        List<Map<String, Object>> invoices = bookings.stream()
                .filter(b -> b.getStatus() != Booking.BookingStatus.Cancelled && b.getStatus() != Booking.BookingStatus.Rejected)
                .map(b -> {
                    Map<String, Object> map = new HashMap<>();
                    boolean isPaid = b.getStatus() == Booking.BookingStatus.Completed;
                    map.put("id", b.getId());
                    map.put("service", b.getService());
                    map.put("providerName", b.getProviderName());
                    map.put("date", b.getDate());
                    map.put("time", b.getTime());
                    map.put("amount", b.getAmount());
                    map.put("isPaid", isPaid);
                    map.put("tax", Math.round(b.getAmount() * 0.05));
                    map.put("total", b.getAmount());
                    map.put("invoiceId", b.getInvoiceId() != null ? b.getInvoiceId() : "INV" + b.getId());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(invoices);
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        getCustomer(userDetails.getUsername());

        Long bookingId = Long.valueOf(body.get("bookingId").toString());
        Map<String, Object> res = paymentService.initiatePayment(bookingId, userDetails.getUsername());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User customer = getCustomer(userDetails.getUsername());

        Long bookingId = Long.valueOf(body.get("bookingId").toString());
        String paymentId = body.getOrDefault("paymentId", "pay_" + UUID.randomUUID().toString().substring(0, 8)).toString();
        String signature = body.getOrDefault("signature", "sig_" + UUID.randomUUID().toString().substring(0, 8)).toString();
        String method = body.getOrDefault("paymentMethod", "UPI").toString();

        Map<String, Object> res = paymentService.verifyPayment(bookingId, paymentId, signature, userDetails.getUsername());

        // Create and save Payment entity record
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Set payment details on booking
        booking.setPaymentId(paymentId);
        booking.setPaymentMethod(method);
        booking.setPaidAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);

        Payment payment = Payment.builder()
                .booking(booking)
                .customerId(customer.getId())
                .amount(booking.getAmount())
                .paymentMethod(method)
                .paymentId(paymentId)
                .status("Completed")
                .build();
        paymentRepository.save(payment);

        return ResponseEntity.ok(res);
    }
}
