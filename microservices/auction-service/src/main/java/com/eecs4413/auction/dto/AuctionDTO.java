package com.eecs4413.auction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionDTO {
    private Long auctionId;
    private Long itemId;
    private String itemName;
    private int currentPrice;
    private String type;
    private String remainingTime;
    private OffsetDateTime endsAt;
    private String highestBidder;
}
