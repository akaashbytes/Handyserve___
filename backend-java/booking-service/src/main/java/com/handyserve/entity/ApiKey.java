package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "HS_API_KEYS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "api_key_gen")
    @SequenceGenerator(name = "api_key_gen", sequenceName = "HS_API_KEY_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "API_IDENTIFIER", nullable = false, unique = true, length = 40)
    private String apiIdentifier;

    @Column(name = "KEY_VALUE", nullable = false, length = 60)
    private String keyValue;

    @Column(name = "FEATURE_NAME", nullable = false, length = 150)
    private String featureName;

    @Column(name = "COMPONENT_NAME", length = 150)
    private String componentName;

    @Column(name = "PAGE_NAME", length = 100)
    private String pageName;

    @Column(name = "HTTP_METHOD", length = 10)
    private String httpMethod;

    @Column(name = "ENDPOINT_PATTERN", length = 200)
    private String endpointPattern;

    @Column(name = "ALLOWED_ROLES", length = 100)
    private String allowedRoles;

    @Builder.Default
    @Column(name = "ACTIVE")
    private Boolean active = true;

    @Builder.Default
    @Column(name = "RATE_LIMIT_PER_MINUTE")
    private Integer rateLimitPerMinute = 60;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}
