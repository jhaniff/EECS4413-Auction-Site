package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.AuthenticationResponseDTO;
import com.eecs4413.auction_platform.dto.RegisterDTO;
import com.eecs4413.auction_platform.dto.SignInDTO;
import com.eecs4413.auction_platform.exception.UserCredentialsException;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.OffsetDateTime;

@Service
public class UserService {
    private UserRepository userRepository;
    private JWTService jwtService;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(10);
    private AuthenticationManager authenticationManager;
    @Autowired
    private ApplicationContext context;

    public UserService(UserRepository userRepository, AuthenticationManager authenticationManager, JWTService jwtService){
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthenticationResponseDTO registerUser(RegisterDTO registerDTO){
        // Check confirm password
        if(!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())){
            throw new UserCredentialsException("Passwords do not match");
        }
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

        return AuthenticationResponseDTO.builder()
                .accessToken(jwtService.generateToken(registerDTO.getEmail()))
                .refreshToken(jwtService.generateRefreshToken(registerDTO.getEmail()))
                .build();
    }

    public AuthenticationResponseDTO authenticate(SignInDTO signInDTO) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(signInDTO.getEmail(), signInDTO.getPassword()));
        if(authentication.isAuthenticated())
            return AuthenticationResponseDTO.builder()
                    .refreshToken(jwtService.generateToken(signInDTO.getEmail()))
                    .accessToken(jwtService.generateRefreshToken(signInDTO.getEmail()))
                    .build();
        throw new UserCredentialsException("Authentication Failed User not authenticated");
    }

    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if(authHeader != null && authHeader.startsWith("Bearer ")){
            token = authHeader.substring(7);
            username = jwtService.extractUserName(token);
        }else{
            return;
        }
        if(username != null){
            User user = userRepository.findByEmail(username);
            if(jwtService.validateToken(token, user.getEmail())){
                var accessToken = jwtService.generateToken(user.getEmail());
                var authResponse = AuthenticationResponseDTO.builder()
                        .accessToken(accessToken)
                        .refreshToken(token)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }

}
