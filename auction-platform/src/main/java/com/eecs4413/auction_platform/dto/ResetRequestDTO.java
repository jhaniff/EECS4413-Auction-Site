package com.eecs4413.auction_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetRequestDTO {
    private String uuid;
    private String code;
    private String newPassword;
}
