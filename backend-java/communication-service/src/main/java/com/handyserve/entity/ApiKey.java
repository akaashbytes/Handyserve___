package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Stores every API key mapped to a frontend component/button/feature.
 * Table: HS_API_KEYS (Oracle)
 */
@Entity
@Table(name = "HS_API_KEYS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "api_key_gen")
    @SequenceGenerator(name = "api_key_gen", sequenceName = "HS_API_KEY_SEQ", allocationSize = 1)
    private Long id;

    /** Human-readable identifier e.g. HSP-AUTH-LOGIN */
    @Column(name = "API_IDENTIFIER", nullable = false, unique = true, length = 40)
    private String apiIdentifier;

    /** The raw key value stored PLAIN so the filter can do direct equality check.
     *  In production, store hashed and compare with SHA-256. */
    @Column(name = "KEY_VALUE", nullable = false, length = 60)
    private String keyValue;

    /** Short label shown in docs / Postman */
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

    /** CSV of roles that may use this key: "public", "customer", "provider", "admin", "all" */
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
