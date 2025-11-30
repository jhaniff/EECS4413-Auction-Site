package com.eecs4413.payment.dto;

import com.eecs4413.payment.model.Auction;
import com.eecs4413.payment.model.User;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetailDTO {
     private Long paymentID;
     private String firstName;
     private String lastName;
     private String streetName;
     private String streetNumber;
     private String city;
     private String country;
     private String postalCode;
     private BigDecimal totalBaseCost;
     private BigDecimal totalExpeditedCost;
     private OffsetDateTime paymentDate;
     private OffsetDateTime expectedDeliveryDate;
}
