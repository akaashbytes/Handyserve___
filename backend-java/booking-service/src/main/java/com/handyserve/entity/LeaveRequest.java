package com.handyserve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "HS_LEAVE_REQUESTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "leave_seq")
    @SequenceGenerator(name = "leave_seq", sequenceName = "HS_LEAVE_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROVIDER_ID", nullable = false)
    private User provider;

    @Column(name = "PROVIDER_NAME", length = 100)
    private String providerName;

    @Column(length = 100)
    private String skill;

    @Column(name = "LEAVE_DATE", nullable = false, length = 20)
    private String date;              // YYYY-MM-DD

    /**
     * Comma-separated time slots, e.g. "9 AM,10 AM,11 AM"
     * Stored as VARCHAR2 in Oracle; deserialized as List<String> in service layer.
     */
    @Column(name = "TIME_SLOTS", length = 500)
    private String timeSlots;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.pending;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    public enum LeaveStatus { pending, approved, rejected }

    /** Convenience: get time slots as a List */
    public List<String> getTimeSlotsAsList() {
        if (timeSlots == null || timeSlots.isBlank()) return List.of();
        return List.of(timeSlots.split(","));
    }

    /** Convenience: set time slots from a List */
    public void setTimeSlotsFromList(List<String> slots) {
        this.timeSlots = slots == null ? "" : String.join(",", slots);
    }
}
