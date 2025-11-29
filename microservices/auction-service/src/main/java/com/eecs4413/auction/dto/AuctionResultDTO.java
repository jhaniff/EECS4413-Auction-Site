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
public class AuctionResultDTO {
    private Long auctionId;
    private String itemName;
    private int winningBid;
    private Long winnerId;
    private String winnerName;
    private OffsetDateTime finalizedAt;
    private String status;
}
