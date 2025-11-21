package com.eecs4413.gateway.feign;

import com.eecs4413.gateway.dto.TokenValidationResponse;
import jakarta.ws.rs.core.HttpHeaders;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name="authentication-service")
public interface AuthenticationClient {

    @PostMapping("/api/auth/validate")
    TokenValidationResponse validateToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader);

}
