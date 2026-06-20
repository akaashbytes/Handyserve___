package com.handyserve.controller;

import com.handyserve.document.Dispute;
import com.handyserve.repository.mongo.DisputeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/disputes/internal")
public class InternalDisputeController {

    private final DisputeRepository disputeRepository;

    public InternalDisputeController(DisputeRepository disputeRepository) {
        this.disputeRepository = disputeRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getDisputeStats() {
        long openCount = disputeRepository.countByStatus("Open");
        List<Dispute> recent = disputeRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .collect(Collectors.toList());

        List<Map<String, Object>> recentList = recent.stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("bookingId", d.getBookingId());
            m.put("customer", d.getCustomer());
            m.put("date", d.getDate());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("openDisputesCount", openCount);
        stats.put("recentDisputes", recentList);
        return stats;
    }
}
