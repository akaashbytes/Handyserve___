package com.handyserve.service;

import com.handyserve.dto.AnalyticsDto;
import com.handyserve.entity.Booking;
import com.handyserve.entity.LeaveRequest;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.LeaveRequestRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.client.CommFeignClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final CommFeignClient commFeignClient;

    public AnalyticsService(BookingRepository bookingRepository,
                            UserRepository userRepository,
                            LeaveRequestRepository leaveRequestRepository,
                            CommFeignClient commFeignClient) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.commFeignClient = commFeignClient;
    }

    @Transactional(readOnly = true)
    public AnalyticsDto getAdminAnalytics(String adminEmail) {
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.admin) {
            throw new RuntimeException("Access denied: Admin only");
        }

        // Get dispute stats from communication service
        Map<String, Object> disputeStats = null;
        try {
            disputeStats = commFeignClient.getDisputeStats();
        } catch (Exception e) {
            // Fallback if communication service is down
            disputeStats = Map.of("openDisputesCount", 0L, "recentDisputes", new ArrayList<>());
        }

        // 1. Overview Metrics
        Double totalRev = bookingRepository.totalRevenue();
        long totalBk = bookingRepository.count();
        long activeProv = userRepository.findByRoleAndBlockedFalse(User.Role.provider).size();
        long activeCust = userRepository.findByRoleAndBlockedFalse(User.Role.customer).size();
        long pendingLv = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus.pending).size();
        long openDisputes = ((Number) disputeStats.getOrDefault("openDisputesCount", 0L)).longValue();

        List<Booking> allBookings = bookingRepository.findAll();
        double avgRating = allBookings.stream()
                .filter(b -> b.getRating() != null)
                .mapToDouble(Booking::getRating)
                .average()
                .orElse(0.0);

        long completedBk = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed)
                .count();

        double completionRate = totalBk > 0 ? ((double) completedBk / totalBk) * 100.0 : 0.0;

        // Calculate customer retention: (Customers with >= 2 bookings) / (Total customers who booked at least once) * 100
        Map<Long, Long> bookingsPerCustomer = allBookings.stream()
                .filter(b -> b.getCustomer() != null)
                .collect(Collectors.groupingBy(b -> b.getCustomer().getId(), Collectors.counting()));
        long totalBookingCustomers = bookingsPerCustomer.size();
        long repeatCustomers = bookingsPerCustomer.values().stream().filter(count -> count >= 2).count();
        double customerRetention = totalBookingCustomers > 0 
                ? ((double) repeatCustomers / totalBookingCustomers) * 100.0 
                : 0.0;

        // Calculate provider rejection rate: (Bookings with status = Rejected) / (Total bookings) * 100
        long rejectedBk = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Rejected)
                .count();
        double providerRejectionRate = totalBk > 0 
                ? ((double) rejectedBk / totalBk) * 100.0 
                : 0.0;

        // Calculate refund rate: (Cancelled but Paid bookings) / (Total bookings) * 100
        long refundedBk = allBookings.stream()
                .filter(b -> b.getPaidAt() != null && b.getStatus() == Booking.BookingStatus.Cancelled)
                .count();
        double refundRate = totalBk > 0 
                ? ((double) refundedBk / totalBk) * 100.0 
                : 0.0;

        AnalyticsDto.Overview overview = AnalyticsDto.Overview.builder()
                .totalRevenue(totalRev)
                .totalBookings(totalBk)
                .activeProviders(activeProv)
                .activeCustomers(activeCust)
                .pendingLeaves(pendingLv)
                .openDisputes(openDisputes)
                .platformRating(Math.round(avgRating * 10.0) / 10.0)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .customerRetention(Math.round(customerRetention * 10.0) / 10.0)
                .providerRejectionRate(Math.round(providerRejectionRate * 10.0) / 10.0)
                .refundRate(Math.round(refundRate * 10.0) / 10.0)
                .build();

        // 2. Monthly Revenue (Strictly dynamic database calculations for the last 6 months)
        List<AnalyticsDto.MonthlyRevenue> monthlyTrend = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter monthNameFormatter = DateTimeFormatter.ofPattern("MMM");
        DateTimeFormatter prefixFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = 5; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            String monthName = targetDate.format(monthNameFormatter);
            String prefix = targetDate.format(prefixFormatter);

            Double realRev = bookingRepository.revenueByMonth(prefix);
            Long realCount = bookingRepository.countByMonth(prefix);

            double finalRev = (realRev != null) ? realRev : 0.0;
            long finalCount = (realCount != null) ? realCount : 0L;

            monthlyTrend.add(new AnalyticsDto.MonthlyRevenue(monthName, finalRev, finalCount));
        }

        // 3. Category Demand (Strictly dynamic database queries)
        List<AnalyticsDto.CategoryDemand> demand = new ArrayList<>();
        List<Object[]> rawDemand = bookingRepository.categoryDemand();

        if (rawDemand != null && !rawDemand.isEmpty()) {
            long totalCategorized = rawDemand.stream().mapToLong(r -> (Long) r[1]).sum();
            for (Object[] row : rawDemand) {
                String service = (String) row[0];
                long count = (Long) row[1];
                double percentage = totalCategorized > 0 ? ((double) count / totalCategorized) * 100.0 : 0.0;
                demand.add(new AnalyticsDto.CategoryDemand(service, Math.round(percentage * 10.0) / 10.0));
            }
        }

        // 4. Provider Performance
        List<User> providers = userRepository.findByRoleAndBlockedFalse(User.Role.provider);
        List<AnalyticsDto.ProviderPerformance> performance = providers.stream()
                .map(p -> {
                    Double rating = bookingRepository.avgRatingByProvider(p.getId()).orElse(0.0);
                    return AnalyticsDto.ProviderPerformance.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .avatar(p.getAvatar() != null ? p.getAvatar() : "P")
                            .rating(Math.round(rating * 10.0) / 10.0)
                            .verified(p.getVerified() != null && p.getVerified())
                            .build();
                })
                .sorted(Comparator.comparing(AnalyticsDto.ProviderPerformance::getRating).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // 5. Recent Activity compiles
        List<AnalyticsDto.RecentActivity> activities = new ArrayList<>();

        // Add recent bookings
        List<Booking> recentBookings = allBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .collect(Collectors.toList());

        for (Booking b : recentBookings) {
            String text = "New job request: " + b.getService() + " booked for " + b.getCustomerName();
            String color = "var(--brand)";
            if (b.getStatus() == Booking.BookingStatus.Completed) {
                text = "Job Completed: Invoice #" + b.getInvoiceId() + " paid by " + b.getCustomerName();
                color = "var(--success)";
            } else if (b.getStatus() == Booking.BookingStatus.Cancelled) {
                text = "Job Cancelled: Booking #" + b.getId() + " cancelled";
                color = "var(--danger)";
            }

            activities.add(AnalyticsDto.RecentActivity.builder()
                    .id("ACT-B-" + b.getId())
                    .text(text)
                    .time(b.getDate() != null ? b.getDate() : "Recent")
                    .color(color)
                    .build());
        }

        // Add recent disputes from communication service
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recentDisputes = (List<Map<String, Object>>) disputeStats.getOrDefault("recentDisputes", new ArrayList<>());

        for (Map<String, Object> d : recentDisputes) {
            activities.add(AnalyticsDto.RecentActivity.builder()
                    .id("ACT-D-" + d.get("id"))
                    .text("Dispute ticket raised for Booking #" + d.get("bookingId") + " by " + d.get("customer"))
                    .time(d.get("date") != null ? (String) d.get("date") : "Recent")
                    .color("var(--danger)")
                    .build());
        }

        // Add recent leaves
        List<LeaveRequest> recentLeaves = leaveRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(3)
                .collect(Collectors.toList());

        for (LeaveRequest l : recentLeaves) {
            activities.add(AnalyticsDto.RecentActivity.builder()
                    .id("ACT-L-" + l.getId())
                    .text("Leave Request: " + l.getProviderName() + " applied for " + l.getDate())
                    .time("Leave Applied")
                    .color("var(--warning)")
                    .build());
        }

        // Sort combined list or take top 5
        List<AnalyticsDto.RecentActivity> finalActivities = activities.stream()
                .limit(5)
                .collect(Collectors.toList());

        return AnalyticsDto.builder()
                .overview(overview)
                .monthlyRevenue(monthlyTrend)
                .categoryDemand(demand)
                .providerPerformance(performance)
                .recentActivities(finalActivities)
                .build();
    }
}
