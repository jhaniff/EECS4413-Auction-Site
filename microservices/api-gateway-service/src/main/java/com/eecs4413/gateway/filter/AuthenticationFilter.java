package com.eecs4413.gateway.filter;

import com.eecs4413.gateway.dto.TokenValidationResponse;
import com.eecs4413.gateway.feign.AuthenticationClient;
import feign.FeignException;
import jakarta.ws.rs.core.HttpHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.HandlerFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

@Component
@RequiredArgsConstructor
public class AuthenticationFilter implements HandlerFilterFunction<ServerResponse, ServerResponse> {

    private final AuthenticationClient authenticationClient;

    @Override
    public ServerResponse filter(ServerRequest request,
                                 HandlerFunction<ServerResponse> next) throws Exception {

        String authHeader = request.headers().firstHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // no token
            return ServerResponse.status(HttpStatus.UNAUTHORIZED).build();
        }

        TokenValidationResponse validation;
        try {
            // call authentication-service via Feign
            validation = authenticationClient.validateToken(authHeader);
        } catch (FeignException e) {
            if (e.status() == 401 || e.status() == 403) {
                return ServerResponse.status(HttpStatus.UNAUTHORIZED).build();
            }
            throw e;
        }

        if (validation == null || !validation.isValid()) {
            return ServerResponse.status(HttpStatus.UNAUTHORIZED).body("Invalid Token");
        }
        URI uri = request.uri();
        String scheme = uri.getScheme();
        String host = uri.getHost();
        int port = uri.getPort();

        int validPort = (port == -1) ? ("https".equalsIgnoreCase(scheme) ? 443 : 80) : port;
        String forwardedHost = (port == -1) ? host : host+":"+validPort;

        // Add headers for internal network microservices so they know they are validated
        ServerRequest mutatedRequest = ServerRequest.from(request)
                .headers(headers ->{
                    headers.remove("AuthenticatedUserId");
                    headers.remove("Username");
                    headers.remove("X-Forwarded-Host");
                    headers.remove("X-Forwarded-Port");
                    headers.remove("X-Forwarded-Proto");
                })
                .header("AuthenticatedUserId", String.valueOf(validation.getUserId()))
                .header("Username", validation.getEmail())
                .header("X-Forwarded-Host", forwardedHost)
                .header("X-Forwarded-Port", String.valueOf(validPort))
                .header("X-Forwarded-Proto", scheme)
                .build();

        return next.handle(mutatedRequest);
    }
}
