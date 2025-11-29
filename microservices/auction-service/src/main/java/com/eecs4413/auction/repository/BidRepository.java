package com.eecs4413.auction.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eecs4413.auction.model.Bid;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
	@Query("""
			SELECT b FROM Bid b
			JOIN FETCH b.auction a
			JOIN FETCH a.item i
			LEFT JOIN FETCH a.highestBidder hb
			WHERE b.bidder.userId = :userId
			""")
	List<Bid> findBidsWithAuctionDetailsByBidderId(@Param("userId") Long userId);
}
