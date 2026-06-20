package com.handyserve.client;

import com.handyserve.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "auth-service", url = "${app.auth-service-url}")
public interface AuthFeignClient {

    @GetMapping("/api/auth/internal/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/auth/internal/users/email/{email}")
    UserDto getUserByEmail(@PathVariable("email") String email);

    @PostMapping("/api/auth/internal/users/{id}/update-stats")
    void updateUserStats(@PathVariable("id") Long id);
}
