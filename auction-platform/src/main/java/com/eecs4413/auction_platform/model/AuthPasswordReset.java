package com.eecs4413.auction_platform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "auth_password_resets")
public class AuthPasswordReset {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant usedAt;

    @Column(nullable = false)
    private String status; // ACTIVE, USED, REVOKED

    @Column(nullable = false)
    private short attempts;

    @Column(nullable = false)
    private short maxAttempts;

    @Column(nullable = false)
    private Instant createdAt;

    public boolean isActive(Instant now) {
        return "ACTIVE".equals(status) && usedAt == null && expiresAt.isAfter(now);
    }
}
