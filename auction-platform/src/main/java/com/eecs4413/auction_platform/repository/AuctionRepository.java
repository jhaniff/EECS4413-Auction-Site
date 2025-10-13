package com.eecs4413.auction_platform.repository;

import com.eecs4413.auction_platform.model.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    @Query("""
    SELECT a FROM Auction a
    WHERE a.item.itemId IN :itemIds
    """)
    Page<Auction> findByItemIds(@Param("itemIds") List<Long> itemIds, Pageable pageable);
}
