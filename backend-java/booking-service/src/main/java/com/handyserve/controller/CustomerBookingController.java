package com.handyserve.controller;

import com.handyserve.dto.BookingDto;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer/bookings")
public class CustomerBookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final com.handyserve.repository.oracle.ApiKeyRepository apiKeyRepository;

    public CustomerBookingController(BookingService bookingService, UserRepository userRepository, com.handyserve.repository.oracle.ApiKeyRepository apiKeyRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.apiKeyRepository = apiKeyRepository;
    }

    @GetMapping("/debug-keys")
    public ResponseEntity<?> getDebugKeys() {
        return ResponseEntity.ok(apiKeyRepository.findAll().stream()
            .map(k -> k.getApiIdentifier() + " = " + k.getKeyValue() + " (active=" + k.getActive() + ")")
            .collect(Collectors.toList()));
    }

    private void verifyCustomer(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (user.getRole() != User.Role.customer) {
            throw new RuntimeException("Unauthorized: Customer role required");
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingDto bookingDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            verifyCustomer(userDetails.getUsername());
            BookingDto created = bookingService.createBooking(bookingDto, userDetails.getUsername());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<BookingDto>> getBookings(
            @RequestParam(required = false, defaultValue = "all") String filter,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        verifyCustomer(userDetails.getUsername());
        List<BookingDto> list = bookingService.getBookings(userDetails.getUsername());

        // Apply simplified filters: Pending, Accepted, Ongoing, Completed, Cancelled, Paid, Unpaid
        if (!"all".equalsIgnoreCase(filter)) {
            list = list.stream().filter(b -> {
                String status = b.getStatus();
                if ("Pending".equalsIgnoreCase(filter)) {
                    return "Requested".equalsIgnoreCase(status);
                }
                if ("Accepted".equalsIgnoreCase(filter)) {
                    return "Accepted".equalsIgnoreCase(status);
                }
                if ("Ongoing".equalsIgnoreCase(filter)) {
                    return "On the way".equalsIgnoreCase(status) ||
                            "On_the_Way".equalsIgnoreCase(status) ||
                            "Destination".equalsIgnoreCase(status) ||
                            "Reached".equalsIgnoreCase(status) ||
                            "Reached Confirmed".equalsIgnoreCase(status) ||
                            "Reached_Confirmed".equalsIgnoreCase(status);
                }
                if ("Completed".equalsIgnoreCase(filter)) {
                    return "Completed".equalsIgnoreCase(status);
                }
                if ("Cancelled".equalsIgnoreCase(filter)) {
                    return "Cancelled".equalsIgnoreCase(status) || "Rejected".equalsIgnoreCase(status);
                }
                if ("Paid".equalsIgnoreCase(filter)) {
                    return "Completed".equalsIgnoreCase(status);
                }
                if ("Unpaid".equalsIgnoreCase(filter)) {
                    return "Pending Payment".equalsIgnoreCase(status) || "Pending_Payment".equalsIgnoreCase(status);
                }
                return true;
            }).collect(Collectors.toList());
        }

        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        verifyCustomer(userDetails.getUsername());
        try {
            BookingDto bookingDto = bookingService.getBooking(id, userDetails.getUsername());
            return ResponseEntity.ok(bookingDto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDto> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        verifyCustomer(userDetails.getUsername());
        try {
            BookingDto updated = bookingService.updateBookingStatus(id, status, userDetails.getUsername());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<BookingDto> rateBooking(
            @PathVariable Long id,
            @RequestParam Integer rating,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        verifyCustomer(userDetails.getUsername());
        try {
            BookingDto updated = bookingService.rateBooking(id, rating, userDetails.getUsername());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
}
