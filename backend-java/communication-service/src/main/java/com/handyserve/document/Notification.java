package com.handyserve.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private Long userId;

    private String title;

    @Builder.Default
    private String message = "";

    @Builder.Default
    private String icon = "🔔";

    @Builder.Default
    private Boolean read = false;

    @Builder.Default
    private String link = "";

    @CreatedDate
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
}
