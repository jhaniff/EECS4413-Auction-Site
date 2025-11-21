package com.eecs4413.payment.dto;

import com.eecs4413.payment.model.Auction;
import com.eecs4413.payment.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetailDTO {
     private Long paymentID;
     private Auction auction;
     private User payee;
     private OffsetDateTime paymentDate;
     private OffsetDateTime expectedDeliveryDate;
}
