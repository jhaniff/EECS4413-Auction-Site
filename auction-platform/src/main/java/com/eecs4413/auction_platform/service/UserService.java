package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.AuthenticationResponseDTO;
import com.eecs4413.auction_platform.dto.RegisterDTO;
import com.eecs4413.auction_platform.dto.SignInDTO;
import com.eecs4413.auction_platform.exception.DatabaseOperationException;
import com.eecs4413.auction_platform.exception.UserCredentialsException;
import com.eecs4413.auction_platform.model.Token;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.TokenRepository;
import com.eecs4413.auction_platform.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class UserService {
    private UserRepository userRepository;
    private JWTService jwtService;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(10);
    private AuthenticationManager authenticationManager;
    private TokenRepository tokenRepository;
    @Autowired
    private ApplicationContext context;

    public UserService(UserRepository userRepository, AuthenticationManager authenticationManager, JWTService jwtService, TokenRepository tokenRepository){
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
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
                .passwordHash(bCryptPasswordEncoder.encode(registerDTO.getPassword()))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .isActive(true)
                .address(registerDTO.getUserAddress())
                .build();
        user.getAddress().setUser(user);

        userRepository.save(user);
        String accessToken = jwtService.generateToken(registerDTO.getEmail());

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
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(signInDTO.getEmail(), signInDTO.getPassword()));
        if(authentication.isAuthenticated()) {
            User user = userRepository.findByEmail(signInDTO.getEmail());
            String accessToken = jwtService.generateToken(signInDTO.getEmail());
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
        throw new UserCredentialsException("Authentication Failed User not authenticated");
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
