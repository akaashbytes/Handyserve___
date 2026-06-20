package com.handyserve.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDto {
    private String id;
    private String title;
    private String message;
    private String icon;
    private Boolean read;
    private String time; // format "dd MMM, hh:mm a"
}
