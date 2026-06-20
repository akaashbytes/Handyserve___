package com.handyserve.sockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handyserve.security.JwtService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private static final Map<String, String> userEmailToSessionId = new ConcurrentHashMap<>();

    public WebSocketHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String token = null;
        if (query != null && query.contains("token=")) {
            token = query.split("token=")[1].split("&")[0];
        }

        if (token != null && jwtService.isTokenValid(token)) {
            String email = jwtService.extractEmail(token);
            session.getAttributes().put("email", email);
            userEmailToSessionId.put(email, session.getId());
            sessions.put(session.getId(), session);
        } else {
            session.close(CloseStatus.POLICY_VIOLATION);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        String email = (String) session.getAttributes().get("email");
        if (email != null) {
            userEmailToSessionId.remove(email);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        try {
            Map<?, ?> data = objectMapper.readValue(payload, Map.class);
            String type = (String) data.get("type");

            if ("provider:location".equals(type) || "chat:message".equals(type) || "booking:status".equals(type) || "notification:push".equals(type)) {
                broadcastToAll(payload);
            }
        } catch (Exception e) {
            // Fail silently on parse errors
        }
    }

    public void sendMessageToUser(String email, String message) {
        String sessionId = userEmailToSessionId.get(email);
        if (sessionId != null) {
            WebSocketSession session = sessions.get(sessionId);
            if (session != null && session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    // Ignore or log
                }
            }
        }
    }

    public void broadcastToAll(String message) {
        TextMessage textMessage = new TextMessage(message);
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    // Ignore
                }
            }
        }
    }
}
