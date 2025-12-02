package com.eecs4413.auction.dto;

import java.time.OffsetDateTime;

import org.springframework.hateoas.server.core.Relation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Relation(collectionRelation = "bids")
public class UserBidSummaryDTO {
    private Long auctionId;
    private Long itemId;
    private String itemName;
    private int currentPrice;
    private int userBidAmount;
    private String status;
    private boolean winning;
    private boolean paid;
    private Long paymentId;
    private OffsetDateTime endsAt;
    private OffsetDateTime lastBidAt;
}
