package com.eecs4413.auction_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WinnerDTO {
     private Long userId;
     private String firstName;
     private String lastName;
     private String streetName;
     private String streetNumber;
     private String city;
     private String province;
     private String country;
     private String postalCode;
}
