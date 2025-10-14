package com.eecs4413.auction_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BidRequestDTO {
    private Long auctionId;
    private Long bidderId;
    private int amount;
}
