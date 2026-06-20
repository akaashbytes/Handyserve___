package com.handyserve.controller;

import com.handyserve.dto.UserDto;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.repository.oracle.ApiKeyRepository;
import com.handyserve.service.UserService;
import com.handyserve.security.JwtService;
import com.handyserve.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/internal")
public class InternalUserController {

    private final UserRepository userRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final UserService userService;
    private final JwtService jwtService;

    public InternalUserController(UserRepository userRepository, 
                                  ApiKeyRepository apiKeyRepository, 
                                  UserService userService, 
                                  JwtService jwtService) {
        this.userRepository = userRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(UserMapper::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(UserMapper::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/update-stats")
    public ResponseEntity<Void> updateUserStats(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(userService::updateUserStats);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validate-token")
    public ResponseEntity<UserDto> validateToken(@RequestParam String token) {
        if (jwtService.isTokenValid(token)) {
            String email = jwtService.extractEmail(token);
            return userRepository.findByEmailIgnoreCase(email)
                    .map(UserMapper::fromEntity)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/validate-api-key")
    public ResponseEntity<Boolean> validateApiKey(@RequestParam String apiKey) {
        boolean valid = apiKeyRepository.findByKeyValueAndActiveTrue(apiKey).isPresent();
        return ResponseEntity.ok(valid);
    }
}
