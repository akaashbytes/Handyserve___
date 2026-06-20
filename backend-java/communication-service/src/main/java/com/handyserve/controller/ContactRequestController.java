package com.handyserve.controller;

import com.handyserve.dto.ContactRequestDto;
import com.handyserve.service.ContactRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactRequestController {

    private final ContactRequestService contactRequestService;

    public ContactRequestController(ContactRequestService contactRequestService) {
        this.contactRequestService = contactRequestService;
    }

    @PostMapping
    public ResponseEntity<ContactRequestDto> submitContact(
            @RequestBody ContactRequestDto dto) {
        ContactRequestDto created = contactRequestService.submitContact(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ContactRequestDto>> getContactRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            List<ContactRequestDto> list = contactRequestService.getContactRequests(userDetails.getUsername());
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ContactRequestDto> updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            ContactRequestDto updated = contactRequestService.updateStatus(id, status, userDetails.getUsername());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }
}
