package com.handyserve.mapper;

import com.handyserve.document.Notification;
import com.handyserve.dto.NotificationDto;

import java.time.format.DateTimeFormatter;

public class NotificationMapper {
    public static NotificationDto fromDocument(Notification doc) {
        if (doc == null) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM, hh:mm a");
        return NotificationDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .message(doc.getMessage())
                .icon(doc.getIcon())
                .read(doc.getRead())
                .time(doc.getCreatedAt() != null ? doc.getCreatedAt().format(formatter) : "")
                .build();
    }
}
