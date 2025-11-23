package com.eecs4413.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
     private Long paymentID;
     private String firstName;
     private String lastName;
     private OffsetDateTime deliveryDate;
     private String message; // e.g. "Payment successful.  "
}
