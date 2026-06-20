package com.handyserve.controller;

import com.handyserve.dto.DisputeDto;
import com.handyserve.service.DisputeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
public class DisputeController {

    private final DisputeService disputeService;

    public DisputeController(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    @PostMapping
    public ResponseEntity<DisputeDto> createDispute(
            @RequestBody DisputeDto disputeDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        DisputeDto created = disputeService.createDispute(disputeDto, userDetails.getUsername());
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<DisputeDto>> getDisputes(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        List<DisputeDto> list = disputeService.getDisputes(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisputeDto> getDispute(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            DisputeDto disputeDto = disputeService.getDispute(id, userDetails.getUsername());
            return ResponseEntity.ok(disputeDto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DisputeDto> updateDisputeStatus(
            @PathVariable String id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            DisputeDto updated = disputeService.updateDisputeStatus(id, status, userDetails.getUsername());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/updates")
    public ResponseEntity<DisputeDto> addDisputeUpdate(
            @PathVariable String id,
            @RequestBody DisputeDto.UpdateEntryDto updateDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            DisputeDto updated = disputeService.addDisputeUpdate(id, updateDto.getNote(), userDetails.getUsername());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
