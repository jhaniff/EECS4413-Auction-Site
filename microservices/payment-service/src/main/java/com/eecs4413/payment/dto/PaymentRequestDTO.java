package com.eecs4413.payment.dto;

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
public class PaymentRequestDTO {
     private Long auctionID;
     private Long paymentID;
     private User user;
     private String firstName;
     private String lastName;
     private String streetName;
     private String streetNumber;
     private String city;
     private String country;
     private String postalCode;
     private String cardNumber;
     private String nameOnCard;
     private OffsetDateTime expiryDate;
     private String securityCode;
     private boolean isExpedited;
}
