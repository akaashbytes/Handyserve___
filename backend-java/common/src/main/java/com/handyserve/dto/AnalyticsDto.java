package com.handyserve.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsDto {
    private Overview overview;
    private List<MonthlyRevenue> monthlyRevenue;
    private List<CategoryDemand> categoryDemand;
    private List<ProviderPerformance> providerPerformance;
    private List<RecentActivity> recentActivities;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Overview {
        private Double totalRevenue;
        private Long totalBookings;
        private Long activeProviders;
        private Long activeCustomers;
        private Long pendingLeaves;
        private Long openDisputes;
        private Double platformRating;
        private Double completionRate;
        private Double customerRetention;
        private Double providerRejectionRate;
        private Double refundRate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyRevenue {
        private String month;
        private Double revenue;
        private Long bookings;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryDemand {
        private String name;
        private Double value; // percentage
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProviderPerformance {
        private Long id;
        private String name;
        private String avatar;
        private Double rating;
        private Boolean verified;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentActivity {
        private String id;
        private String text;
        private String time;
        private String color;
    }
}
