package com.handyserve.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "auth-service", url = "${app.auth-service-url}")
public interface AuthFeignClient {

    @PostMapping("/api/auth/internal/users/{id}/update-stats")
    void updateUserStats(@PathVariable("id") Long id);
}
