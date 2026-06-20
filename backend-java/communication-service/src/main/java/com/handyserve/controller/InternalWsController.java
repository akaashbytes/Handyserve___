package com.handyserve.controller;

import com.handyserve.sockets.WebSocketHandler;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/ws")
public class InternalWsController {

    private final WebSocketHandler webSocketHandler;

    public InternalWsController(WebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    @PostMapping("/broadcast")
    public void broadcast(@RequestBody String message) {
        webSocketHandler.broadcastToAll(message);
    }

    @PostMapping("/send-to-user")
    public void sendToUser(@RequestParam("email") String email, @RequestBody String message) {
        webSocketHandler.sendMessageToUser(email, message);
    }
}
