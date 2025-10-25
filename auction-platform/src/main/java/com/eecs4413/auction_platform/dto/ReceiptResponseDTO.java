package com.eecs4413.auction_platform.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReceiptResponseDTO {
     private String firstName;
     private String lastName;
     private String streetName;
     private String streetNumber;
     private String city;
     private String country;
     private String postalCode;
     private BigDecimal totalPaid;
     private Long itemID;
     private OffsetDateTime shippingDate;
     private String message;

}
