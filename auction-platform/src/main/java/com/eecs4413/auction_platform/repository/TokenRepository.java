package com.eecs4413.auction_platform.repository;

import com.eecs4413.auction_platform.model.Token;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    @Transactional
    void deleteAllByUser_userId(Long userId);

    @Transactional
    void deleteAllByUser_email(String email);

    Optional<Token> findByToken(String token);
}
