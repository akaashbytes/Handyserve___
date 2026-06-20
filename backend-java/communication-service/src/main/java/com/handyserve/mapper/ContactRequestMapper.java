package com.handyserve.mapper;

import com.handyserve.document.ContactRequest;
import com.handyserve.dto.ContactRequestDto;

public class ContactRequestMapper {
    public static ContactRequestDto fromDocument(ContactRequest doc) {
        if (doc == null) return null;
        return ContactRequestDto.builder()
                .id(doc.getId())
                .name(doc.getName())
                .email(doc.getEmail())
                .phone(doc.getPhone())
                .message(doc.getMessage())
                .status(doc.getStatus())
                .date(doc.getDate())
                .build();
    }
}
