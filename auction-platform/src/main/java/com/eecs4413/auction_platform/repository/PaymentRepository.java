package com.eecs4413.auction_platform.repository;
import com.eecs4413.auction_platform.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
     @Query("""
    SELECT p FROM Payment p
    JOIN FETCH p.payee u
    LEFT JOIN FETCH u.address
    LEFT JOIN FETCH u.bids b
    JOIN FETCH p.auction a
    JOIN FETCH a.item i
    WHERE p.paymentID = :id
""")
     Optional<Payment> findDetailedById(@Param("id") Long id);

}
