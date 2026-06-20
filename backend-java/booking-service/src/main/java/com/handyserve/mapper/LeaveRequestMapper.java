package com.handyserve.mapper;

import com.handyserve.dto.LeaveRequestDto;
import com.handyserve.entity.LeaveRequest;

public class LeaveRequestMapper {
    public static LeaveRequestDto fromEntity(LeaveRequest leave) {
        if (leave == null) return null;
        return LeaveRequestDto.builder()
                .id(leave.getId())
                .providerId(leave.getProvider() != null ? leave.getProvider().getId() : null)
                .providerName(leave.getProviderName())
                .skill(leave.getSkill())
                .date(leave.getDate())
                .timeSlots(leave.getTimeSlotsAsList())
                .reason(leave.getReason())
                .status(leave.getStatus().name())
                .createdAt(leave.getCreatedAt())
                .build();
    }
}
