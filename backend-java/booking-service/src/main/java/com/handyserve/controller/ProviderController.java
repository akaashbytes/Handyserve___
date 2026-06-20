package com.handyserve.controller;

import com.handyserve.dto.UserDto;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.mapper.UserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public ProviderController(UserRepository userRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> listProviders(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String search) {

        List<User> providers = userRepository.searchProviders(
                User.Role.provider,
                city,
                serviceType,
                search
        );

        List<UserDto> dtos = providers.stream()
                .map(UserMapper::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/test-rating")
    public ResponseEntity<?> testRating() {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        try {
            List<User> providers = userRepository.findByRoleAndBlockedFalse(User.Role.provider);
            map.put("providersCount", providers.size());
            java.util.List<java.util.Map<String, Object>> provList = new java.util.ArrayList<>();
            for (User provider : providers) {
                java.util.Map<String, Object> pMap = new java.util.HashMap<>();
                pMap.put("id", provider.getId());
                pMap.put("name", provider.getName());
                pMap.put("email", provider.getEmail());
                
                // Original values
                pMap.put("orig_averageRating", provider.getAverageRating());
                pMap.put("orig_reliabilityScore", provider.getReliabilityScore());
                pMap.put("orig_reviews", provider.getReviews());
                
                // Calculate values
                Double avgRating = bookingRepository.avgRatingByProvider(provider.getId()).orElse(0.0);
                long completedCount = bookingRepository.countByProviderAndStatus(provider, com.handyserve.entity.Booking.BookingStatus.Completed);
                long cancelledCount = bookingRepository.countByProviderAndStatus(provider, com.handyserve.entity.Booking.BookingStatus.Cancelled);
                long totalCount = completedCount + cancelledCount;

                int reliability = 0;
                if (totalCount > 0) {
                    double completionRate = ((double) completedCount / totalCount) * 100.0;
                    if (bookingRepository.avgRatingByProvider(provider.getId()).isPresent()) {
                        reliability = (int) Math.round(completionRate * 0.5 + (avgRating * 20.0) * 0.5);
                    } else {
                        reliability = (int) Math.round(completionRate);
                    }
                }
                long reviewsCount = bookingRepository.countByProviderAndStatusAndRatingIsNotNull(provider, com.handyserve.entity.Booking.BookingStatus.Completed);

                double newAvgRating = Math.round(avgRating * 10.0) / 10.0;
                
                pMap.put("calc_avgRating", newAvgRating);
                pMap.put("calc_reliability", reliability);
                pMap.put("calc_reviewsCount", reviewsCount);
                
                // Set and save
                provider.setAverageRating(newAvgRating);
                provider.setReliabilityScore(reliability);
                provider.setReviews((int) reviewsCount);
                
                User savedUser = userRepository.saveAndFlush(provider);
                pMap.put("saved_averageRating", savedUser.getAverageRating());
                pMap.put("saved_reliabilityScore", savedUser.getReliabilityScore());
                pMap.put("saved_reviews", savedUser.getReviews());
                
                // Fetch fresh from repository to verify DB write
                User freshUser = userRepository.findById(provider.getId()).orElse(null);
                if (freshUser != null) {
                    pMap.put("fresh_averageRating", freshUser.getAverageRating());
                }
                
                provList.add(pMap);
            }
            map.put("providers", provList);
        } catch (Exception e) {
            map.put("error", e.getMessage());
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            map.put("stackTrace", sw.toString());
        }
        return ResponseEntity.ok(map);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getProvider(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(u -> u.getRole() == User.Role.provider)
                .map(UserMapper::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<UserDto>> getNearbyProviders(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "10.0") Double radius) {

        List<User> providers = userRepository.findByRoleAndBlockedFalse(User.Role.provider);

        List<UserDto> nearby = providers.stream()
                .filter(u -> u.getLatitude() != null && u.getLongitude() != null)
                .filter(u -> haversineDistanceKm(lat, lon, u.getLatitude(), u.getLongitude()) <= radius)
                .map(UserMapper::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(nearby);
    }

    @PatchMapping("/{id}/block")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<UserDto> blockProvider(@PathVariable Long id, @RequestParam Boolean blocked) {
        return userRepository.findById(id)
                .filter(u -> u.getRole() == User.Role.provider)
                .map(u -> {
                    u.setBlocked(blocked);
                    userRepository.save(u);
                    return ResponseEntity.ok(UserMapper.fromEntity(u));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> verifyProvider(@PathVariable Long id, @RequestParam Boolean verified) {
        return userRepository.findById(id)
                .filter(u -> u.getRole() == User.Role.provider)
                .map(u -> {
                    if (!verified) {
                        userRepository.delete(u);
                        return ResponseEntity.ok().build();
                    } else {
                        u.setVerified(true);
                        userRepository.save(u);
                        return ResponseEntity.ok(UserMapper.fromEntity(u));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> deleteProvider(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(u -> u.getRole() == User.Role.provider)
                .map(u -> {
                    userRepository.delete(u);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<UserDto> updateAvailability(@PathVariable Long id, @RequestParam Boolean available) {
        return userRepository.findById(id)
                .filter(u -> u.getRole() == User.Role.provider)
                .map(u -> {
                    u.setAvailable(available);
                    userRepository.save(u);
                    return ResponseEntity.ok(UserMapper.fromEntity(u));
                })
                .orElse(ResponseEntity.notFound().build());
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
