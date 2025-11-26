package com.eecs4413.payment.repository;

import com.eecs4413.payment.model.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    @Query("""
    SELECT a FROM Auction a
    WHERE a.item.itemId IN :itemIds AND a.status = 'ONGOING'
    """)
    Page<Auction> findByItemIds(@Param("itemIds") List<Long> itemIds, Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.status = 'ONGOING' AND a.endsAt <= :now")
    List<Auction> findExpiredAuctions(@Param("now") OffsetDateTime now);

}
