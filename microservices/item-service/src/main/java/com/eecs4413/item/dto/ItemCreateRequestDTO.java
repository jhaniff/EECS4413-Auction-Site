package com.eecs4413.item.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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

    @NonNull
    @Positive
    private Integer startPrice;

    @NonNull
    private OffsetDateTime endsAt;

    // Free-form tags supplied by the seller; validation trims and drops blanks later on.
    private List<@NotBlank String> keywords;

    private Long userId;
}
