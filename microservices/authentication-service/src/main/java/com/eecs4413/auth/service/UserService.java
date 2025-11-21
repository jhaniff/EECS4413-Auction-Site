package com.eecs4413.auth.service;

import com.eecs4413.auth.dto.AuthenticationResponseDTO;
import com.eecs4413.auth.dto.RegisterDTO;
import com.eecs4413.auth.dto.SignInDTO;
import com.eecs4413.auth.dto.TokenValidationResponse;
import com.eecs4413.auth.exception.UserCredentialsException;
import com.eecs4413.auth.model.Token;
import com.eecs4413.auth.model.User;
import com.eecs4413.auth.repository.TokenRepository;
import com.eecs4413.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class UserService {
    private UserRepository userRepository;
    private JWTService jwtService;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private TokenRepository tokenRepository;
    private AuctionUserDetailsService auctionUserDetailsService;

    public UserService(UserRepository userRepository, AuthenticationManager authenticationManager, JWTService jwtService, TokenRepository tokenRepository, PasswordEncoder passwordEncoder, AuctionUserDetailsService auctionUserDetailsService){
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.auctionUserDetailsService = auctionUserDetailsService;
    }

    @Transactional
    public AuthenticationResponseDTO registerUser(RegisterDTO registerDTO){
        // Check confirm password
        if(!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())){
            throw new UserCredentialsException("Password and Confirm Password do not match");
        }

        validatePassword(registerDTO.getPassword());

        User user = User.builder()
                .email(registerDTO.getEmail())
                .firstName(registerDTO.getFirstName())
                .lastName(registerDTO.getLastName())
                .passwordHash(passwordEncoder.encode(registerDTO.getPassword()))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .isActive(true)
                .address(registerDTO.getUserAddress())
                .build();
        user.getAddress().setUser(user);

        userRepository.save(user);
        String accessToken = jwtService.generateToken(user);

        Token token = Token.builder()
                .token(accessToken)
                .user(user)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);

        return AuthenticationResponseDTO.builder()
                .accessToken(accessToken)
                .build();
    }

    @Transactional
    public AuthenticationResponseDTO authenticate(SignInDTO signInDTO) {
        try{
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(signInDTO.getEmail(), signInDTO.getPassword()));
            if(authentication.isAuthenticated()) {
                User user = userRepository.findByEmail(signInDTO.getEmail()).orElseThrow(()-> new UserCredentialsException("User not found") );
                String accessToken = jwtService.generateToken(user);
                Token token = Token.builder()
                        .token(accessToken)
                        .user(user)
                        .expired(false)
                        .revoked(false)
                        .build();
                tokenRepository.save(token);

                return AuthenticationResponseDTO.builder()
                        .accessToken(accessToken)
                        .build();
            }
            throw new UserCredentialsException("Authentication Failed User Not Authenticated");
        }catch(AuthenticationException e){
            throw new UserCredentialsException("Authentication Failed User Not Authenticated");
        }
    }

    public TokenValidationResponse validateTokenRequest(String authHeader) {
        String token = null;
        String username = null;
        Long userId = null;
        try{
            if(authHeader != null && authHeader.startsWith("Bearer ")){
                token = authHeader.substring(7);
                username = jwtService.extractUserName(token);
                userId = jwtService.extractUserId(token);
            }
            User user = userRepository.findByEmail(username).orElseThrow(()-> new UserCredentialsException("User not found") );
            if (jwtService.validateToken(token, user.getEmail()) && jwtService.isTokenValid(token)) {
                return TokenValidationResponse.builder()
                        .valid(true)
                        .userId(userId)
                        .email(user.getEmail())
                        .build();
            }
        }catch(Exception e){
            // Extract Username or UserId failed meaning not a valid JWT token
        }


        return TokenValidationResponse.builder()
                .valid(false)
                .userId(null)
                .email(null)
                .build();
    }

    public void revokeAllForUser(Long userId) {
        tokenRepository.deleteAllByUser_userId(userId);
    }

    public void logoutUser(Long id) {
        revokeAllForUser(id);
    }

    public void validatePassword(String pwd) {
        if (pwd == null || pwd.length() < 8)
            throw new UserCredentialsException("Password must be at least 8 characters long");
        if (!pwd.matches(".*[A-Za-z].*"))
            throw new UserCredentialsException("Password must contain at least one letter");
        if (!pwd.matches(".*\\d.*"))
            throw new UserCredentialsException("Password must contain at least one number");
        if (pwd.contains(" "))
            throw new UserCredentialsException("Password must not contain spaces");
    }


}
