package com.handyserve.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "contact_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactRequest {

    @Id
    private String id;

    private String name;
    private String email;

    @Builder.Default
    private String phone = "";

    private String message;

    @Builder.Default
    private String status = "pending";

    private String date;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
