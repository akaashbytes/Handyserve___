package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "HS_USERS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    private Long id;

    private String name;
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "PROFILE_PHOTO")
    private String profilePhoto;

    public enum Role { customer, provider, admin }
}
