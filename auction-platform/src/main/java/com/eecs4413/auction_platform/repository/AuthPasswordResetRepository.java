package com.eecs4413.auction_platform.repository;

import com.eecs4413.auction_platform.model.AuthPasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthPasswordResetRepository extends JpaRepository<AuthPasswordReset, UUID> {

    @Query("""
      select r from AuthPasswordReset r
      where r.id = :id
    """)
    Optional<AuthPasswordReset> findAny(UUID id);

    @Query("""
      select r from AuthPasswordReset r
      where r.id = :id
        and r.status = 'ACTIVE'
        and r.usedAt is null
        and r.expiresAt > :now
    """)
    Optional<AuthPasswordReset> findActive(UUID id, Instant now);
}
