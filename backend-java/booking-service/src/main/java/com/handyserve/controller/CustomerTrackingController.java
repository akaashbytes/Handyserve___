package com.handyserve.controller;

import com.handyserve.entity.Booking;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/tracking")
public class CustomerTrackingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public CustomerTrackingController(BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getLiveTracking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User customer = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).build();
        }

        Map<String, Object> res = new HashMap<>();
        res.put("bookingId", booking.getId());
        res.put("status", booking.getStatus().name());
        res.put("customerLatitude", booking.getCustomerLatitude());
        res.put("customerLongitude", booking.getCustomerLongitude());
        res.put("providerLatitude", booking.getProviderLatitude());
        res.put("providerLongitude", booking.getProviderLongitude());

        if (booking.getCustomerLatitude() != null && booking.getCustomerLongitude() != null &&
                booking.getProviderLatitude() != null && booking.getProviderLongitude() != null) {
            double distance = haversineDistanceKm(
                    booking.getCustomerLatitude(), booking.getCustomerLongitude(),
                    booking.getProviderLatitude(), booking.getProviderLongitude()
            );
            res.put("distanceKm", distance);
            res.put("etaMins", Math.max(3, (int) Math.round(distance * 6)));
        } else {
            res.put("distanceKm", null);
            res.put("etaMins", null);
        }

        return ResponseEntity.ok(res);
    }

    private double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }
}
