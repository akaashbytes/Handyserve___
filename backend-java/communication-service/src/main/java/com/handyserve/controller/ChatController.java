package com.handyserve.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handyserve.document.ChatMessage;
import com.handyserve.entity.Booking;
import com.handyserve.entity.User;
import com.handyserve.repository.mongo.ChatMessageRepository;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.sockets.WebSocketHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings/{bookingId}/chat")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Boolean mongoAvailable = null;
    private long lastChecked = 0;

    private synchronized boolean isMongoAlive() {
        long now = System.currentTimeMillis();
        if (mongoAvailable == null || (now - lastChecked) > 15000) { // recheck every 15 seconds
            lastChecked = now;
            try (java.net.Socket socket = new java.net.Socket()) {
                socket.connect(new java.net.InetSocketAddress("localhost", 27017), 100);
                mongoAvailable = true;
            } catch (Exception e) {
                mongoAvailable = false;
            }
        }
        return mongoAvailable;
    }

    public ChatController(ChatMessageRepository chatMessageRepository,
                          BookingRepository bookingRepository,
                          UserRepository userRepository,
                          WebSocketHandler webSocketHandler) {
        this.chatMessageRepository = chatMessageRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.webSocketHandler = webSocketHandler;
    }

    @GetMapping
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Access check
        if (user.getRole() != User.Role.admin &&
                !booking.getCustomer().getId().equals(user.getId()) &&
                (booking.getProvider() == null || !booking.getProvider().getId().equals(user.getId()))) {
            return ResponseEntity.status(403).build();
        }

        List<ChatMessage> history;
        if (isMongoAlive()) {
            try {
                history = chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
            } catch (Exception e) {
                System.err.println("[CHAT] MongoDB connection failed, falling back to in-memory history: " + e.getMessage());
                history = InMemoryChatStorage.getMessages(bookingId);
            }
        } else {
            history = InMemoryChatStorage.getMessages(bookingId);
        }
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendChatMessage(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        String text = payload.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Access check
        if (user.getRole() != User.Role.admin &&
                !booking.getCustomer().getId().equals(user.getId()) &&
                (booking.getProvider() == null || !booking.getProvider().getId().equals(user.getId()))) {
            return ResponseEntity.status(403).build();
        }

        ChatMessage msg = ChatMessage.builder()
                .bookingId(bookingId)
                .senderId(user.getId())
                .senderName(user.getName())
                .senderEmail(user.getEmail())
                .text(text.trim())
                .createdAt(LocalDateTime.now())
                .build();

        if (isMongoAlive()) {
            try {
                msg = chatMessageRepository.save(msg);
            } catch (Exception e) {
                System.err.println("[CHAT] MongoDB connection failed, saving in-memory: " + e.getMessage());
                msg = InMemoryChatStorage.save(msg);
            }
        } else {
            msg = InMemoryChatStorage.save(msg);
        }

        // Broadcast via WebSocket
        try {
            Map<String, Object> wsMsg = new HashMap<>();
            wsMsg.put("type", "chat:message");
            wsMsg.put("bookingId", bookingId);
            wsMsg.put("id", msg.getId());
            wsMsg.put("senderId", msg.getSenderId());
            wsMsg.put("senderName", msg.getSenderName());
            wsMsg.put("senderEmail", msg.getSenderEmail());
            wsMsg.put("text", msg.getText());
            wsMsg.put("createdAt", msg.getCreatedAt().toString());

            String jsonPayload = objectMapper.writeValueAsString(wsMsg);
            webSocketHandler.broadcastToAll(jsonPayload);
        } catch (Exception e) {
            // Silently swallow serialization error
        }

        return ResponseEntity.ok(msg);
    }

    // Thread-safe in-memory fallback helper
    private static class InMemoryChatStorage {
        private static final List<ChatMessage> messages = new java.util.concurrent.CopyOnWriteArrayList<>();
        private static final java.util.concurrent.atomic.AtomicLong idGenerator = new java.util.concurrent.atomic.AtomicLong(1);

        public static List<ChatMessage> getMessages(Long bookingId) {
            return messages.stream()
                    .filter(m -> bookingId.equals(m.getBookingId()))
                    .sorted(java.util.Comparator.comparing(ChatMessage::getCreatedAt))
                    .toList();
        }

        public static ChatMessage save(ChatMessage msg) {
            if (msg.getId() == null) {
                msg.setId(UUID.randomUUID().toString());
            }
            messages.add(msg);
            return msg;
        }
    }
}
