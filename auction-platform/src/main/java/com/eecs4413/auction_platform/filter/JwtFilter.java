package com.eecs4413.auction_platform.filter;


import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.TokenRepository;
import com.eecs4413.auction_platform.repository.UserRepository;
import com.eecs4413.auction_platform.service.AuctionUserDetailsService;
import com.eecs4413.auction_platform.service.JWTService;
import com.eecs4413.auction_platform.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {


    private final JWTService jwtService;


    @Autowired
    ApplicationContext context;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // check auth header and if the jwt token was sent with request of Bearer Auth
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            token = authHeader.substring(7);
            username = jwtService.extractUserName(token);
        }
        // Checks if the username is not available and if the user has been authenticated before if so we can skip to next filter
        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){

            // getting userdetails from the Userdetails implemented class
            UserDetails userDetails = context.getBean(AuctionUserDetailsService.class).loadUserByUsername(username);
            // Validating token with content and database.
            if(jwtService.validateToken(token, userDetails.getUsername()) && jwtService.isTokenValid(token)){
                // Setting user as authenticated.
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
