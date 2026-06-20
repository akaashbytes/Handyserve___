package com.handyserve.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactRequestDto {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String message;
    private String status; // pending | replied | closed
    private String date;
}
