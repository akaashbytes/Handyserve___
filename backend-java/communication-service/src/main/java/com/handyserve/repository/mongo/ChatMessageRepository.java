package com.handyserve.repository.mongo;

import com.handyserve.document.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByBookingIdOrderByCreatedAtAsc(Long bookingId);
}
