package com.eecs4413.gateway.config;

import com.eecs4413.gateway.filter.AuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicate;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.*;


@Configuration
@RequiredArgsConstructor
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;

    @Bean
    public RouterFunction<ServerResponse> gatewayRoutes() {

        return route("logout_route")
                .route(path("/api/auth/logout"), http())
                .before(uri("lb://authentication-service"))
                .filter(authenticationFilter)
                .build()

                .and(route("auction_route")
                        .route(path("/api/auction/**"), http())
                        .before(uri("lb://auction-service"))
                        .filter(authenticationFilter)
                        .build())

                .and(route("payment_route")
                        .route(path("/api/payment/**"), http())
                        .before(uri("lb://payment-service"))
                        .filter(authenticationFilter)
                        .build())

                .and(route("item_route")
                        .route(path("/api/item/**"), http())
                        .before(uri("lb://item-service"))
                        .filter(authenticationFilter)
                        .build())

                .and(route("public_auth_route")
                        .POST("/api/auth/validate", http())
                        .POST("/api/auth/login", http())
                        .POST("/api/auth/forgot", http())
                        .POST("/api/auth/forgot/reset", http())
                        .POST("/api/auth/register", http())
                        .before(uri("lb://authentication-service"))
                        .build());
    }
}