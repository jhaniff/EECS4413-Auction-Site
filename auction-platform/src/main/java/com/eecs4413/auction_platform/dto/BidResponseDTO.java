package com.eecs4413.auction_platform.dto;


import lombok.*;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidResponseDTO {
    private Long auctionId;
    private int newHighestBid;
    private Long highestBidderId;
    private String highestBidderName;
    private OffsetDateTime updatedAt;
    private String message; // e.g. "Bid placed successfully"
}
