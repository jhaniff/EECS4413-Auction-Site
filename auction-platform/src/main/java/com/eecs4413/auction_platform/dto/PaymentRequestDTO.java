package com.eecs4413.auction_platform.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
     private Long auctionID;
     private Long paymentID;
     private String firstName;
     private String lastName;
     private String streetName;
     private String streetNumber;
     private String city;
     private String country;
     private String postalCode;
     private Long cardNumber;
     private String nameOnCard;
     private Date expiryDate;
     private Long securityCode;
}
