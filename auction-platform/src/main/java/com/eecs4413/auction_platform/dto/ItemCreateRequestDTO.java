package com.eecs4413.auction_platform.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCreateRequestDTO {

    // Request payload a seller submits when creating a new item listing.
    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    private String description;

    @Size(max = 50)
    private String type;

    @NotNull
    @PositiveOrZero
    private Integer shippingDays;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal baseShipCost;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal expeditedCost;

    // Free-form tags supplied by the seller; validation trims and drops blanks later on.
    private List<@NotBlank String> keywords;
}
