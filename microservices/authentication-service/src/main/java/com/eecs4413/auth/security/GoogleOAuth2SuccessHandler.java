package com.eecs4413.auth.security;

import com.eecs4413.auth.model.Token;
import com.eecs4413.auth.model.User;
import com.eecs4413.auth.service.JWTService;
import com.eecs4413.auth.service.UserService;
import com.eecs4413.auth.repository.TokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    @Lazy
    private UserService userService;   // <-- Lazy to break circular dependency

    private final JWTService jwtService;
    private final TokenRepository tokenRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public GoogleOAuth2SuccessHandler(
            JWTService jwtService,
            TokenRepository tokenRepository
    ) {
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // load or create user
        User user = userService.loadOrCreateUserFromGoogle(email, name);

        // create JWT
        String token = jwtService.generateToken(user);

        // save token
        tokenRepository.save(Token.builder()
                .token(token)
                .user(user)
                .expired(false)
                .revoked(false)
                .build());

        // redirect to frontend with JWT
        response.sendRedirect(frontendUrl + "/oauth-success?token=" + token);
    }
}
