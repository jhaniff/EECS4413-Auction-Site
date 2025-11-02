package com.eecs4413.auction_platform.controller;

import com.eecs4413.auction_platform.dto.*;
import com.eecs4413.auction_platform.model.UserPrincipal;
import com.eecs4413.auction_platform.service.PasswordResetService;
import com.eecs4413.auction_platform.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class AuthenticationController {

    private UserService userService;
    private PasswordResetService passwordResetService;

    public AuthenticationController(UserService userService, PasswordResetService passwordResetService){
        this.userService = userService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponseDTO> register(@RequestBody RegisterDTO registerDTO){
        return ResponseEntity.ok(userService.registerUser(registerDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> login(@RequestBody SignInDTO signInDTO){
        return ResponseEntity.ok(userService.authenticate(signInDTO));
    }

    @PostMapping("/forgot")
    public ResponseEntity<Void> forgot(@RequestBody ForgotRequestDTO forgotRequestDTO, HttpServletRequest http) {
        passwordResetService.requestForgotPassword(forgotRequestDTO.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot/reset")
    public ResponseEntity<Void> reset(@RequestBody ResetRequestDTO resetRequestDTO) {
        passwordResetService.resetPassword(resetRequestDTO.getUuid(), resetRequestDTO.getCode(), resetRequestDTO.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout/")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal me){
        userService.revokeAllForUser(me.getUser().getUserId());
        return ResponseEntity.ok().build();
    }

}
