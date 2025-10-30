package com.eecs4413.auction_platform.dto;

import com.eecs4413.auction_platform.model.Auction;
import com.eecs4413.auction_platform.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
     private Long paymentID;
     private Auction auction;
     private User payee;
}
