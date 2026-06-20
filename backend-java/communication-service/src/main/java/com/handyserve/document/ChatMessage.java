package com.handyserve.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    @Field("booking_id")
    private Long bookingId;

    @Field("sender_id")
    private Long senderId;

    @Field("sender_name")
    private String senderName;

    @Field("sender_email")
    private String senderEmail;

    private String text;

    @CreatedDate
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
}
