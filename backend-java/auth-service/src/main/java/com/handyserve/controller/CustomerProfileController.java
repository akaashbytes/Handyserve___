package com.handyserve.controller;

import com.handyserve.dto.UserDto;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/profile")
public class CustomerProfileController {

    private final UserService userService;
    private final UserRepository userRepository;

    public CustomerProfileController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    private void verifyCustomer(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (user.getRole() != User.Role.customer) {
            throw new RuntimeException("Unauthorized: Customer role required");
        }
    }

    @PatchMapping
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDto updatedData) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        verifyCustomer(userDetails.getUsername());
        UserDto userDto = userService.updateProfile(userDetails.getUsername(), updatedData);
        return ResponseEntity.ok(userDto);
    }
}
