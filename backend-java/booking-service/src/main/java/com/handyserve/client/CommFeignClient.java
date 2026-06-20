package com.handyserve.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "communication-service", url = "${app.comm-service-url}")
public interface CommFeignClient {

    @PostMapping("/api/internal/ws/broadcast")
    void broadcast(@RequestBody String message);

    @PostMapping("/api/internal/ws/send-to-user")
    void sendToUser(@RequestParam("email") String email, @RequestBody String message);
    
    @GetMapping("/api/disputes/internal/stats")
    java.util.Map<String, Object> getDisputeStats();
}
