package com.handyserve.controller;

import com.handyserve.dto.AuthResponse;
import com.handyserve.dto.UserDto;
import com.handyserve.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/auth")
public class CustomerAuthController {

    private final UserService userService;

    public CustomerAuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/validate-session")
    public ResponseEntity<UserDto> validateSession(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        UserDto userDto = userService.getUserByEmail(userDetails.getUsername());
        if (!"customer".equalsIgnoreCase(userDto.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            AuthResponse authRes = userService.refresh(refreshToken);
            if (!"customer".equalsIgnoreCase(authRes.getUser().getRole())) {
                return ResponseEntity.status(403).build();
            }
            setRefreshTokenCookie(response, authRes.getRefreshToken());
            return ResponseEntity.ok(authRes);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails, HttpServletResponse response) {
        if (userDetails != null) {
            userService.logout(userDetails.getUsername());
        }

        // Clear HttpOnly refresh token cookie
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false) // Set to true in production
                .path("/api")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.noContent().build();
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken == null) return;

        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true in production
                .path("/api")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
