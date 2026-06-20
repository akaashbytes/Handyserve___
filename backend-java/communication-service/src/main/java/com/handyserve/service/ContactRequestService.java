package com.handyserve.service;

import com.handyserve.document.ContactRequest;
import com.handyserve.dto.ContactRequestDto;
import com.handyserve.entity.User;
import com.handyserve.repository.mongo.ContactRequestRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.mapper.ContactRequestMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactRequestService {

    private final ContactRequestRepository contactRequestRepository;
    private final UserRepository userRepository;

    public ContactRequestService(ContactRequestRepository contactRequestRepository,
                                 UserRepository userRepository) {
        this.contactRequestRepository = contactRequestRepository;
        this.userRepository = userRepository;
    }

    public ContactRequestDto submitContact(ContactRequestDto dto) {
        String humanDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("d MMM yyyy"));

        ContactRequest doc = ContactRequest.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone() != null ? dto.getPhone() : "")
                .message(dto.getMessage())
                .status("pending")
                .date(humanDate)
                .createdAt(LocalDateTime.now())
                .build();

        doc = contactRequestRepository.save(doc);
        return ContactRequestMapper.fromDocument(doc);
    }

    public List<ContactRequestDto> getContactRequests(String adminEmail) {
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.admin) {
            throw new RuntimeException("Access denied: Only admins can view contact requests");
        }

        List<ContactRequest> list = contactRequestRepository.findAllByOrderByCreatedAtDesc();
        return list.stream()
                .map(ContactRequestMapper::fromDocument)
                .collect(Collectors.toList());
    }

    public ContactRequestDto updateStatus(String id, String status, String adminEmail) {
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.admin) {
            throw new RuntimeException("Access denied: Only admins can manage contact requests");
        }

        ContactRequest doc = contactRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact request not found"));

        doc.setStatus(status.toLowerCase());
        doc = contactRequestRepository.save(doc);
        return ContactRequestMapper.fromDocument(doc);
    }
}
