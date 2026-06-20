package com.handyserve.service;

import com.handyserve.dto.LeaveRequestDto;
import com.handyserve.entity.Booking;
import com.handyserve.entity.LeaveRequest;
import com.handyserve.entity.LeaveRequest.LeaveStatus;
import com.handyserve.entity.User;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.LeaveRequestRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.mapper.LeaveRequestMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               BookingRepository bookingRepository,
                               UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public LeaveRequestDto createLeaveRequest(LeaveRequestDto dto, String providerEmail) {
        User provider = userRepository.findByEmailIgnoreCase(providerEmail)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (provider.getRole() != User.Role.provider) {
            throw new RuntimeException("Only service providers can request leave");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .provider(provider)
                .providerName(provider.getName())
                .skill(provider.getServiceType())
                .date(dto.getDate())
                .reason(dto.getReason())
                .status(LeaveStatus.pending)
                .build();

        leave.setTimeSlotsFromList(dto.getTimeSlots());

        leave = leaveRequestRepository.save(leave);
        return LeaveRequestMapper.fromEntity(leave);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getLeaveRequests(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LeaveRequest> list;
        if (user.getRole() == User.Role.provider) {
            list = leaveRequestRepository.findByProviderOrderByCreatedAtDesc(user);
        } else if (user.getRole() == User.Role.admin) {
            list = leaveRequestRepository.findAllByOrderByCreatedAtDesc();
        } else if (user.getRole() == User.Role.customer) {
            list = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.approved);
        } else {
            throw new RuntimeException("Unauthorized role to view leaves");
        }

        return list.stream()
                .map(LeaveRequestMapper::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDto updateLeaveStatus(Long id, String statusStr, String adminEmail) {
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.admin) {
            throw new RuntimeException("Only admin can approve/reject leave requests");
        }

        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        LeaveStatus nextStatus = LeaveStatus.valueOf(statusStr.toLowerCase());

        if (nextStatus == LeaveStatus.approved) {
            // Conflict check
            List<String> slots = leave.getTimeSlotsAsList();
            List<Booking.BookingStatus> excluded = Arrays.asList(
                    Booking.BookingStatus.Completed,
                    Booking.BookingStatus.Cancelled,
                    Booking.BookingStatus.Rejected
            );

            for (String slot : slots) {
                String trimmedSlot = slot.trim();
                String altSlot = getAlternativeTimeSlot(trimmedSlot);

                boolean hasConflict = bookingRepository.existsByProviderAndDateAndTimeAndStatusNotIn(
                        leave.getProvider(),
                        leave.getDate(),
                        trimmedSlot,
                        excluded
                ) || (altSlot != null && !altSlot.equals(trimmedSlot) && bookingRepository.existsByProviderAndDateAndTimeAndStatusNotIn(
                        leave.getProvider(),
                        leave.getDate(),
                        altSlot,
                        excluded
                ));

                if (hasConflict) {
                    throw new RuntimeException("Cannot approve: Customer bookings exist on this date/time (" + leave.getDate() + " " + trimmedSlot + ").");
                }
            }
        }

        leave.setStatus(nextStatus);
        leave = leaveRequestRepository.save(leave);
        return LeaveRequestMapper.fromEntity(leave);
    }

    private String getAlternativeTimeSlot(String slot) {
        if (slot == null) return null;
        slot = slot.trim();
        if (slot.contains(":00")) {
            return slot.replace(":00", "");
        } else if (slot.contains(" ")) {
            String[] parts = slot.split(" ");
            if (parts.length == 2) {
                return parts[0] + ":00 " + parts[1];
            }
        }
        return slot;
    }
}
