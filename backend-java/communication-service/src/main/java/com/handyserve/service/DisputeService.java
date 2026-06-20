package com.handyserve.service;

import com.handyserve.document.Dispute;
import com.handyserve.document.Dispute.UpdateEntry;
import com.handyserve.dto.DisputeDto;
import com.handyserve.entity.Booking;
import com.handyserve.entity.User;
import com.handyserve.repository.mongo.DisputeRepository;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.sockets.WebSocketHandler;
import com.handyserve.mapper.DisputeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WebSocketHandler webSocketHandler;

    public DisputeService(DisputeRepository disputeRepository,
                          BookingRepository bookingRepository,
                          UserRepository userRepository,
                          WebSocketHandler webSocketHandler) {
        this.disputeRepository = disputeRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.webSocketHandler = webSocketHandler;
    }

    @Transactional(readOnly = true)
    public List<DisputeDto> getDisputes(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Dispute> disputes;
        if (user.getRole() == User.Role.customer) {
            disputes = disputeRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());
        } else if (user.getRole() == User.Role.provider) {
            disputes = disputeRepository.findByServiceProviderIdOrderByCreatedAtDesc(user.getId());
        } else {
            disputes = disputeRepository.findAllByOrderByCreatedAtDesc();
        }

        return disputes.stream()
                .map(DisputeMapper::fromDocument)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DisputeDto getDispute(String id, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispute not found"));

        if (user.getRole() != User.Role.admin &&
                !dispute.getCustomerId().equals(user.getId()) &&
                !dispute.getServiceProviderId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this dispute");
        }

        return DisputeMapper.fromDocument(dispute);
    }

    public DisputeDto createDispute(DisputeDto dto, String customerEmail) {
        User customer = userRepository.findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized booking reference");
        }

        User provider = booking.getProvider();

        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("d MMM yyyy"));
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a"));

        UpdateEntry initialUpdate = UpdateEntry.builder()
                .id("U" + System.currentTimeMillis())
                .actor("Customer")
                .actorRole("customer")
                .note("Ticket raised from web portal.")
                .at(timestamp)
                .build();

        Dispute dispute = Dispute.builder()
                .bookingId(booking.getId())
                .customerId(customer.getId())
                .customer(customer.getName())
                .customerEmail(customer.getEmail())
                .serviceProviderId(provider.getId())
                .provider(provider.getName())
                .providerEmail(provider.getEmail())
                .issue(dto.getIssue())
                .issueCategory(dto.getIssueCategory() != null ? dto.getIssueCategory() : "General issue")
                .priority(dto.getPriority() != null ? dto.getPriority() : "Medium")
                .source(dto.getSource() != null ? dto.getSource() : "web")
                .amount(booking.getAmount())
                .status("Open")
                .date(dateStr)
                .createdAt(LocalDateTime.now())
                .updates(new ArrayList<>(List.of(initialUpdate)))
                .build();

        dispute = disputeRepository.save(dispute);
        webSocketHandler.broadcastToAll("{\"type\":\"notification:push\",\"message\":\"New dispute ticket #" + dispute.getId() + " opened.\"}");
        return DisputeMapper.fromDocument(dispute);
    }

    public DisputeDto updateDisputeStatus(String id, String status, String adminEmail) {
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.admin) {
            throw new RuntimeException("Only admins can change dispute status");
        }

        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispute not found"));

        dispute.setStatus(status);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a"));
        UpdateEntry update = UpdateEntry.builder()
                .id("U" + System.currentTimeMillis())
                .actor("Admin")
                .actorRole("admin")
                .note("Status updated to " + status + ".")
                .at(timestamp)
                .build();

        dispute.getUpdates().add(0, update);
        dispute = disputeRepository.save(dispute);
        webSocketHandler.broadcastToAll("{\"type\":\"notification:push\",\"message\":\"Dispute #" + dispute.getId() + " status updated to " + status + ".\"}");

        return DisputeMapper.fromDocument(dispute);
    }

    public DisputeDto addDisputeUpdate(String id, String note, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispute not found"));

        if (user.getRole() != User.Role.admin &&
                !dispute.getCustomerId().equals(user.getId()) &&
                !dispute.getServiceProviderId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this dispute");
        }

        String actorName = user.getName();
        String actorRole = user.getRole().name();

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm a"));
        UpdateEntry update = UpdateEntry.builder()
                .id("U" + System.currentTimeMillis())
                .actor(actorName)
                .actorRole(actorRole)
                .note(note)
                .at(timestamp)
                .build();

        dispute.getUpdates().add(0, update);
        dispute = disputeRepository.save(dispute);
        webSocketHandler.broadcastToAll("{\"type\":\"notification:push\",\"message\":\"New update added to Dispute #" + dispute.getId() + ".\"}");

        return DisputeMapper.fromDocument(dispute);
    }
}
