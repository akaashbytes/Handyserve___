package com.handyserve.controller;

import com.handyserve.dto.UserDto;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer/discover")
public class CustomerDiscoverController {

    private final UserRepository userRepository;

    public CustomerDiscoverController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/providers")
    public ResponseEntity<List<Map<String, Object>>> discoverProviders(
            @RequestParam(required = false, defaultValue = "all") String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "all") String priceRange,
            @RequestParam(required = false, defaultValue = "all") String rating,
            @RequestParam(required = false, defaultValue = "false") Boolean available,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User customer = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<User> providers = userRepository.findByRoleAndBlockedFalse(User.Role.provider);

        // Map UI categories to service type synonyms
        Map<String, List<String>> synonyms = new HashMap<>();
        synonyms.put("plumbing", Arrays.asList("plumb", "pipe", "leak", "tap", "drain"));
        synonyms.put("electrical", Arrays.asList("electri", "wiring", "wire", "fan install", "short circuit"));
        synonyms.put("cleaning", Arrays.asList("clean", "sofa", "carpet", "deep clean"));
        synonyms.put("appliance", Arrays.asList("appliance", "ac ", "fridge", "washing machine", "repair"));
        synonyms.put("pest", Arrays.asList("pest", "termite", "cockroach", "rodent"));
        synonyms.put("painting", Arrays.asList("paint", "texture", "interior", "exterior"));
        synonyms.put("carpentry", Arrays.asList("carpent", "furniture", "door", "cabinet", "wood"));
        synonyms.put("hvac", Arrays.asList("hvac", "duct", "cooling", "ac service"));

        List<Map<String, Object>> results = providers.stream()
                // Must be verified
                .filter(p -> p.getVerified() != null && p.getVerified())
                // City check (same service city if both exist)
                .filter(p -> {
                    String cCity = customer.getServiceCity() != null ? customer.getServiceCity() : customer.getCity();
                    String pCity = p.getServiceCity() != null ? p.getServiceCity() : p.getCity();
                    if (cCity == null || pCity == null) return true;
                    return cCity.equalsIgnoreCase(pCity);
                })
                // Category match
                .filter(p -> {
                    if ("all".equalsIgnoreCase(category)) return true;
                    String svcType = p.getServiceType() != null ? p.getServiceType().toLowerCase() : "";
                    List<String> list = synonyms.get(category.toLowerCase());
                    if (list == null) return svcType.contains(category.toLowerCase());
                    return list.stream().anyMatch(svcType::contains);
                })
                // Keyword search match
                .filter(p -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String query = search.trim().toLowerCase();
                    String name = p.getName() != null ? p.getName().toLowerCase() : "";
                    String svcType = p.getServiceType() != null ? p.getServiceType().toLowerCase() : "";
                    return name.contains(query) || svcType.contains(query);
                })
                // Price match
                .filter(p -> {
                    if ("all".equalsIgnoreCase(priceRange)) return true;
                    int price = p.getPricing() != null && p.getPricing().equalsIgnoreCase("Hourly") ? 400 : 800;
                    if ("low".equalsIgnoreCase(priceRange)) return price < 500;
                    if ("mid".equalsIgnoreCase(priceRange)) return price >= 500 && price < 1000;
                    if ("high".equalsIgnoreCase(priceRange)) return price >= 1000;
                    return true;
                })
                // Rating match
                .filter(p -> {
                    if ("all".equalsIgnoreCase(rating)) return true;
                    try {
                        double minRating = Double.parseDouble(rating);
                        return (p.getAverageRating() != null ? p.getAverageRating() : 0.0) >= minRating;
                    } catch (Exception e) {
                        return true;
                    }
                })
                // Availability match
                .filter(p -> {
                    if (!available) return true;
                    return p.getAvailable() != null && p.getAvailable();
                })
                // Distance and ETA mapping
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("name", p.getName());
                    map.put("service", p.getServiceType() != null ? p.getServiceType() : "Handyman");
                    map.put("rating", p.getAverageRating() != null ? p.getAverageRating() : 0.0);
                    map.put("reviews", p.getReviews() != null ? p.getReviews() : 0);
                    map.put("price", p.getPricing() != null && p.getPricing().equalsIgnoreCase("Hourly") ? 400 : 800);
                    map.put("experience", (p.getExperience() != null ? p.getExperience() : "2") + " Years");
                    map.put("city", p.getServiceCity() != null ? p.getServiceCity() : p.getCity());
                    map.put("available", p.getAvailable() != null ? p.getAvailable() : true);
                    map.put("verified", p.getVerified() != null ? p.getVerified() : false);
                    map.put("avatar", p.getAvatar() != null ? p.getAvatar() : (p.getName() != null && p.getName().length() > 0 ? p.getName().substring(0, 1) : "P"));
                    map.put("image", p.getProfilePhoto());
                    map.put("latitude", p.getLatitude());
                    map.put("longitude", p.getLongitude());

                    if (customer.getLatitude() != null && customer.getLongitude() != null && p.getLatitude() != null && p.getLongitude() != null) {
                        double distance = haversineDistanceKm(customer.getLatitude(), customer.getLongitude(), p.getLatitude(), p.getLongitude());
                        map.put("distanceKm", distance);
                        map.put("etaMins", Math.max(3, (int) Math.round(distance * 6)));
                    } else {
                        map.put("distanceKm", Double.POSITIVE_INFINITY);
                        map.put("etaMins", null);
                    }

                    return map;
                })
                .sorted((a, b) -> {
                    double distA = (double) a.get("distanceKm");
                    double distB = (double) b.get("distanceKm");
                    return Double.compare(distA, distB);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
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
