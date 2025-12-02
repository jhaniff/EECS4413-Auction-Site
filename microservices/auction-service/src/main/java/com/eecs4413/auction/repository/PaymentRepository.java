package com.eecs4413.auction.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eecs4413.auction.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findTopByAuction_AuctionIdAndPayee_UserIdOrderByPaymentDateDesc(Long auctionId, Long userId);
}
