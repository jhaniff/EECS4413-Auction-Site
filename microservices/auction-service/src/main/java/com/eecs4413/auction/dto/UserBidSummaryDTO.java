package com.eecs4413.auction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.hateoas.server.core.Relation;

import java.time.OffsetDateTime;

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
    private OffsetDateTime endsAt;
    private OffsetDateTime lastBidAt;
}
