package com.eecs4413.auth.controller;

import com.eecs4413.auth.dto.*;
import com.eecs4413.auth.model.UserPrincipal;
import com.eecs4413.auth.service.PasswordResetService;
import com.eecs4413.auth.service.UserService;
import jakarta.validation.Valid;
import jakarta.ws.rs.core.HttpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private UserService userService;
    private PasswordResetService passwordResetService;
    @Autowired(required = false)
    private LoadBalancerClient loadBalancerClient;

    public AuthenticationController(UserService userService, PasswordResetService passwordResetService){
        this.userService = userService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponseDTO> register(@Valid @RequestBody RegisterDTO registerDTO){
        return ResponseEntity.ok(userService.registerUser(registerDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> login(@Valid @RequestBody SignInDTO signInDTO){
        return ResponseEntity.ok(userService.authenticate(signInDTO));
    }

    @PostMapping("/forgot")
    public ResponseEntity<Void> forgot(@Valid @RequestBody ForgotRequestDTO forgotRequestDTO) {
        passwordResetService.requestForgotPassword(forgotRequestDTO.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot/reset")
    public ResponseEntity<Void> reset(@Valid @RequestBody ResetRequestDTO resetRequestDTO) {
        passwordResetService.resetPassword(resetRequestDTO.getUuid(), resetRequestDTO.getCode(), resetRequestDTO.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal me){
        userService.revokeAllForUser(me.getUser().getUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader){
       TokenValidationResponse response = userService.validateTokenRequest(authorizationHeader);
       if(!response.isValid())
           return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

       return ResponseEntity.ok(response);
    }

}
