package com.eecs4413.auction_platform.controller;

import com.eecs4413.auction_platform.dto.RegisterDTO;
import com.eecs4413.auction_platform.dto.SignInDTO;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterDTO registerDTO){
        return ResponseEntity.ok(userService.registerUser(registerDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody SignInDTO signInDTO){

        return ResponseEntity.ok(userService.verify(signInDTO));
    }
}
