package com.eecs4413.auction_platform.dto;

import lombok.*;
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
    private boolean isPaid;  // for UC4
}
