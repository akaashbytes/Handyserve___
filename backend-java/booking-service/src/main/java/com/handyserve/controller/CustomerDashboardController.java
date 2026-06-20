package com.handyserve.controller;

import com.handyserve.entity.Booking;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/dashboard")
public class CustomerDashboardController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public CustomerDashboardController(BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User customer = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Booking> bookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(customer);

        String currentMonthPrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String prevMonthPrefix = LocalDate.now().minusMonths(1).format(DateTimeFormatter.ofPattern("yyyy-MM"));

        long totalBookings = bookings.size();
        long currentMonthCount = bookings.stream()
                .filter(b -> b.getDate() != null && b.getDate().startsWith(currentMonthPrefix))
                .count();
        long prevMonthCount = bookings.stream()
                .filter(b -> b.getDate() != null && b.getDate().startsWith(prevMonthPrefix))
                .count();
        long diff = currentMonthCount - prevMonthCount;
        String growthStr = (diff > 0) ? "+" + diff + " this month"
                         : (diff < 0) ? diff + " this month"
                         : (currentMonthCount > 0) ? currentMonthCount + " this month"
                         : "";

        long completedBookings = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed)
                .count();
        long currentMonthCompleted = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed && b.getDate() != null && b.getDate().startsWith(currentMonthPrefix))
                .count();
        long prevMonthCompleted = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed && b.getDate() != null && b.getDate().startsWith(prevMonthPrefix))
                .count();
        long completedDiff = currentMonthCompleted - prevMonthCompleted;
        String completedGrowthStr = (completedDiff > 0) ? "+" + completedDiff + " this month"
                                  : (completedDiff < 0) ? completedDiff + " this month"
                                  : (currentMonthCompleted > 0) ? currentMonthCompleted + " this month"
                                  : "";

        double avgRating = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed && b.getRating() != null)
                .mapToInt(Booking::getRating)
                .average()
                .orElse(0.0);
        double roundedRating = Math.round(avgRating * 10.0) / 10.0;

        List<User> activeProviders = userRepository.findByRoleAndBlockedFalse(User.Role.provider);
        long nearbyProvidersCount = activeProviders.stream()
                .filter(p -> p.getLatitude() != null && p.getLongitude() != null)
                .filter(p -> p.getVerified() != null && p.getVerified())
                .filter(p -> {
                    if (customer.getLatitude() != null && customer.getLongitude() != null) {
                        double distance = haversineDistanceKm(customer.getLatitude(), customer.getLongitude(), p.getLatitude(), p.getLongitude());
                        return distance <= 50.0; // 50km radius
                    } else {
                        return customer.getServiceCity() != null && customer.getServiceCity().equalsIgnoreCase(p.getServiceCity());
                    }
                })
                .count();


        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("totalBookingsGrowth", growthStr);
        stats.put("completedBookings", completedBookings);
        stats.put("completedBookingsGrowth", completedGrowthStr);
        stats.put("averageRating", roundedRating);
        stats.put("nearbyProvidersCount", nearbyProvidersCount);

        return ResponseEntity.ok(stats);
    }

    private double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371.0; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }
}
