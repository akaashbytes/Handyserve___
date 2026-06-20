package com.handyserve.mapper;

import com.handyserve.document.Dispute;
import com.handyserve.dto.DisputeDto;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DisputeMapper {
    public static DisputeDto fromDocument(Dispute dispute) {
        if (dispute == null) return null;
        
        List<DisputeDto.UpdateEntryDto> updatesList = dispute.getUpdates() == null ? new ArrayList<>() :
                dispute.getUpdates().stream()
                        .map(u -> DisputeDto.UpdateEntryDto.builder()
                                .id(u.getId())
                                .actor(u.getActor())
                                .actorRole(u.getActorRole())
                                .note(u.getNote())
                                .at(u.getAt())
                                .build())
                        .collect(Collectors.toList());

        return DisputeDto.builder()
                .id(dispute.getId())
                .bookingId(dispute.getBookingId())
                .customerId(dispute.getCustomerId())
                .customer(dispute.getCustomer())
                .customerEmail(dispute.getCustomerEmail())
                .serviceProviderId(dispute.getServiceProviderId())
                .provider(dispute.getProvider())
                .providerEmail(dispute.getProviderEmail())
                .issue(dispute.getIssue())
                .issueCategory(dispute.getIssueCategory())
                .priority(dispute.getPriority())
                .source(dispute.getSource())
                .amount(dispute.getAmount())
                .status(dispute.getStatus())
                .date(dispute.getDate())
                .createdAt(dispute.getCreatedAt())
                .updates(updatesList)
                .build();
    }
}
