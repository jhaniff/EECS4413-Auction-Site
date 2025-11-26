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
public class AuctionDetailDTO {
    private Long auctionId;
    private String itemName;
    private String itemDescription;
    private int currentPrice;
    private int startPrice;
    private String auctionType;
    private OffsetDateTime endsAt;
    private String remainingTime;
    private Long highestBidderId;
    private String highestBidderName;
}