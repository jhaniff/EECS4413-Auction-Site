package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.RegisterDTO;
import com.eecs4413.auction_platform.dto.SignInDTO;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.UserRepository;
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

    public UserService(UserRepository userRepository, AuthenticationManager authenticationManager, JWTService jwtService){
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public User registerUser(RegisterDTO registerDTO){
        // Check confirm password
        if(!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())){
            throw new IllegalArgumentException("Passwords do not match");
        }
        User user = User.builder()
                .email(registerDTO.getEmail())
                .firstName(registerDTO.getFirstName())
                .lastName(registerDTO.getLastName())
                .passwordHash(bCryptPasswordEncoder.encode(registerDTO.getPassword()))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        return userRepository.save(user);

    }

    public String verify(SignInDTO signInDTO) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(signInDTO.getEmail(), signInDTO.getPassword()));
        if(authentication.isAuthenticated())
            return jwtService.generateToken(signInDTO.getEmail());

        return "Failed";
    }
}
