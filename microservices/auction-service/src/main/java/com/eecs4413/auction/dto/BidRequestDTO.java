package com.eecs4413.auction.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BidRequestDTO {
    @NotNull(message = "auctionId is required")
    private Long auctionId;

    private Long bidderId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be greater than 0")
    private int amount;
}
