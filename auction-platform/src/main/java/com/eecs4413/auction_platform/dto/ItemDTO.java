package com.eecs4413.auction_platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ItemDTO {
    // Snapshot returned to clients describing an item listing.
    private Long itemId;
    private Long sellerId;
    private String name;
    private String description;
    private String type;
    private int shippingDays;
    private BigDecimal baseShipCost;
    private BigDecimal expeditedCost;
    private OffsetDateTime createdAt;
    private boolean isSold;
    private List<String> keywords;
}
