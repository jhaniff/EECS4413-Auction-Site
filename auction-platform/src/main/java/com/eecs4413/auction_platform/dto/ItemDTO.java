package com.eecs4413.auction_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ItemDTO {
    private String name;
    private String description;
    private String type;
    private int shippingDays;
    private OffsetDateTime createdAt;
    private boolean isSold;
}
