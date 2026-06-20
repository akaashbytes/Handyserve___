package com.handyserve.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handyserve.document.Notification;
import com.handyserve.dto.NotificationDto;
import com.handyserve.entity.User;
import com.handyserve.repository.mongo.NotificationRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.sockets.WebSocketHandler;
import com.handyserve.mapper.NotificationMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               WebSocketHandler webSocketHandler) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.webSocketHandler = webSocketHandler;
    }

    public List<NotificationDto> getUserNotifications(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return notifications.stream()
                .map(NotificationMapper::fromDocument)
                .collect(Collectors.toList());
    }

    public void markAsRead(String notificationId, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllRead(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(user.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public void createNotification(Long userId, String title, String message, String icon) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification doc = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .icon(icon)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        doc = notificationRepository.save(doc);

        try {
            Map<String, Object> wsPayload = new HashMap<>();
            wsPayload.put("type", "notification:push");
            wsPayload.put("message", title + ": " + message);
            wsPayload.put("id", doc.getId());
            wsPayload.put("title", title);
            wsPayload.put("text", message);
            wsPayload.put("icon", icon);

            String json = objectMapper.writeValueAsString(wsPayload);
            webSocketHandler.sendMessageToUser(user.getEmail(), json);
        } catch (Exception e) {
            // Ignore
        }
    }
}
