package com.handyserve.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "disputes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Dispute {

    @Id
    private String id;

    @Field("booking_id")
    private Long bookingId;

    @Field("customer_id")
    private Long customerId;
    private String customer;
    @Field("customer_email")
    private String customerEmail;

    @Field("service_provider_id")
    private Long serviceProviderId;
    private String provider;
    @Field("provider_email")
    private String providerEmail;

    private String issue;
    @Field("issue_category")
    @Builder.Default
    private String issueCategory = "General issue";

    @Builder.Default
    private String priority = "Medium";

    @Builder.Default
    private String source = "web";

    private Double amount;

    @Builder.Default
    private String status = "Open";

    @Builder.Default
    private List<UpdateEntry> updates = new ArrayList<>();

    private String date;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateEntry {
        private String id;
        private String actor;
        @Field("actor_role")
        private String actorRole;
        private String note;
        private String at;
    }
}
