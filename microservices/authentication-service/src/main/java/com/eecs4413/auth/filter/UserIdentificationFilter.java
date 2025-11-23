package com.eecs4413.auth.filter;

import com.eecs4413.auth.model.User;
import com.eecs4413.auth.model.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class UserIdentificationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String userId = request.getHeader("AuthenticatedUserId");
        String username = request.getHeader("Username");

        if (userId != null && username != null) {
            User user = new User();
            user.setUserId(Long.valueOf(userId));
            user.setEmail(username);
            UserPrincipal userPrincipal = new UserPrincipal(user);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userPrincipal, null, userPrincipal.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

}
