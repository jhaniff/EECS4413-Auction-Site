package com.eecs4413.auction_platform.dto;

import lombok.*;
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